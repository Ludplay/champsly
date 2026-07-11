import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

type TestStatus = 'idle' | 'running' | 'passed' | 'failed'

type TestCase = {
  id: string
  title: string
  description: string
  status: TestStatus
}

const initialTests: TestCase[] = [
  {
    id: 'render-player-card',
    title: 'Render Player Card',
    description: 'Verify the player card component mounts with expected data.',
    status: 'idle',
  },
  {
    id: 'validate-tournament-form',
    title: 'Validate Tournament Form',
    description: 'Check tournament creation form validation and error messages.',
    status: 'idle',
  },
  {
    id: 'group-list-loads',
    title: 'Group List Loads',
    description: 'Ensure the groups list fetches and displays rows correctly.',
    status: 'idle',
  },
  {
    id: 'phase-schedule-display',
    title: 'Phase Schedule Display',
    description: 'Confirm phase schedule renders match rows in the table.',
    status: 'idle',
  },
]

export default function TestsPage() {
  const [tests, setTests] = useState<TestCase[]>(initialTests)
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set())

  const selectedTests = useMemo(
    () => tests.filter((test) => selectedTestIds.has(test.id)),
    [tests, selectedTestIds],
  )

  const toggleTestSelection = (testId: string) => {
    setSelectedTestIds((current) => {
      const next = new Set(current)
      if (next.has(testId)) {
        next.delete(testId)
      } else {
        next.add(testId)
      }
      return next
    })
  }

  const runTests = (runOnly: TestCase[]) => {
    setTests((currentTests) =>
      currentTests.map((test) =>
        runOnly.some((item) => item.id === test.id)
          ? { ...test, status: 'running' }
          : test,
      ),
    )

    const results: Array<{ id: string; status: TestStatus }> = runOnly.map((test) => ({
      id: test.id,
      status: Math.random() > 0.3 ? 'passed' : 'failed',
    }))

    setTimeout(() => {
      setTests((currentTests) =>
        currentTests.map((test) => {
          const result = results.find((item) => item.id === test.id)
          return result ? { ...test, status: result.status } : test
        }),
      )
    }, 1000)
  }

  const runSelected = () => {
    if (selectedTests.length === 0) {
      return
    }

    runTests(selectedTests)
  }

  const runSingle = (test: TestCase) => {
    runTests([test])
  }

  const resetTests = () => {
    setTests(initialTests)
    setSelectedTestIds(new Set())
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">React tests</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Run selected test cases</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Select the tests you want to execute and trigger them from this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={runSelected} disabled={selectedTests.length === 0}>
            Run selected
          </Button>
          <Button variant="secondary" onClick={resetTests}>
            Reset statuses
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Available React tests</h2>
            <p className="text-sm text-slate-500">
              Pick one or more tests and execute only the cases you need.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            Selected: {selectedTests.length} / {tests.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Select</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Test</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tests.map((test) => (
                <tr key={test.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTestIds.has(test.id)}
                      onChange={() => toggleTestSelection(test.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{test.title}</td>
                  <td className="px-4 py-3 text-slate-600">{test.description}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <span
                      className={
                        test.status === 'passed'
                          ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700'
                          : test.status === 'failed'
                          ? 'inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700'
                          : test.status === 'running'
                          ? 'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700'
                          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700'
                      }
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onClick={() => runSingle(test)}>
                      Run
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
