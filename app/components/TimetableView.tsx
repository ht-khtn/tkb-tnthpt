'use client'

import React from 'react'
import { ScheduleEntry } from '@/app/lib/db-helpers'

const dayLabels: Record<string, string> = {
    T2: 'Thứ 2',
    T3: 'Thứ 3',
    T4: 'Thứ 4',
    T5: 'Thứ 5',
    T6: 'Thứ 6',
    T7: 'Thứ 7',
    CN: 'Chủ nhật',
}

const dayOrder: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const periods = [1, 2, 3, 4, 5]

export default function TimetableView({ entries }: { entries: ScheduleEntry[] }) {
    // Group entries by period and day
    const tableData: Record<number, Record<string, ScheduleEntry[]>> = {}

    periods.forEach(p => {
        tableData[p] = {}
        dayOrder.forEach(d => {
            tableData[p][d] = []
        })
    })

    entries.forEach(entry => {
        if (tableData[entry.periodNo] && tableData[entry.periodNo][entry.day]) {
            tableData[entry.periodNo][entry.day].push(entry)
        }
    })

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr style={{ background: 'var(--accent-soft)' }}>
                        <th
                            className="border p-2 font-semibold"
                            style={{ borderColor: 'var(--stroke)', color: 'var(--ink)' }}
                        >
                            Tiết
                        </th>
                        {dayOrder.map(day => (
                            <th
                                key={day}
                                className="border p-2 font-semibold text-center"
                                style={{ borderColor: 'var(--stroke)', color: 'var(--ink)' }}
                            >
                                {dayLabels[day]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {periods.map(period => (
                        <tr key={period}>
                            <td
                                className="border p-2 font-medium"
                                style={{ borderColor: 'var(--stroke)', color: 'var(--ink)' }}
                            >
                                S{period}
                            </td>
                            {dayOrder.map(day => (
                                <td
                                    key={`${period}-${day}`}
                                    className="border p-2"
                                    style={{
                                        borderColor: 'var(--stroke)',
                                        minHeight: '80px',
                                        verticalAlign: 'top',
                                    }}
                                >
                                    <div className="space-y-1">
                                        {tableData[period][day].length > 0 ? (
                                            tableData[period][day].map(entry => (
                                                <div
                                                    key={entry.id}
                                                    className="rounded p-1 text-xs"
                                                    style={{
                                                        background:
                                                            entry.type === 'class'
                                                                ? 'var(--accent-soft)'
                                                                : 'var(--accent-2-soft)',
                                                        border: `1px solid ${entry.type === 'class' ? 'var(--accent)' : 'var(--accent-2)'
                                                            }`,
                                                        color: 'var(--ink)',
                                                    }}
                                                >
                                                    <div className="font-medium">{entry.subject}</div>
                                                    <div style={{ color: 'var(--muted)' }}>{entry.room}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>-</div>
                                        )}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
