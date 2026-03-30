import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { tap as t } from '../tap'

const debugModuleUrl = pathToFileURL(fileURLToPath(new URL('../../src/internal/debug.ts', import.meta.url))).href

interface ChildResult {
  err: string
  signal: NodeJS.Signals | null
  status: number | null
}

function stripLoaderWarnings(output: string) {
  return output
    .split('\n')
    .filter(line =>
      line.length
      && !line.includes('ExperimentalWarning: Type Stripping')
      && !line.startsWith('(Use `node --trace-warnings'),
    )
    .join('\n')
    .trim()
}

function runChild(nodeDebug: string): Promise<ChildResult> {
  return new Promise((resolve, reject) => {
    const code = [
      `process.env.NODE_DEBUG = ${JSON.stringify(nodeDebug)}`,
      `const mod = await import(${JSON.stringify(debugModuleUrl)})`,
      `mod.debug('hello, world')`,
    ].join('\n')

    const child = spawn(process.execPath, ['--input-type=module', '--eval', code], {
      env: {
        ...process.env,
        NODE_DEBUG: nodeDebug,
      },
    })

    const err: Buffer[] = []
    child.stderr.on('data', (chunk: Buffer) => err.push(chunk))
    child.on('error', reject)
    child.on('close', (status, signal) => {
      const errOutput = Buffer.concat(err).toString('utf8')
      resolve({
        err: stripLoaderWarnings(errOutput),
        signal,
        status,
      })
    })
  })
}

t.test('without env set', async (t) => {
  const res = await runChild('')
  t.equal(res.status, 0, 'success exit status')
  t.equal(res.signal, null, 'no signal')
  t.equal(res.err, '', 'got no output')
})

t.test('with env set', async (t) => {
  const res = await runChild('semver')
  t.equal(res.status, 0, 'success exit status')
  t.equal(res.signal, null, 'no signal')
  t.equal(res.err, 'SEMVER hello, world', 'got expected output')
})
