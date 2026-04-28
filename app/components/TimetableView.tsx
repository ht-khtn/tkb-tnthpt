'use client'

import React from 'react'
import { dayLabels, dayOrder, ScheduleEntry } from '@/app/lib/timetableData'

export default function TimetableView({ entries }: { entries: ScheduleEntry[] }) {
    const byDay = dayOrder.reduce<Record<string, ScheduleEntry[]>>((acc, d) => {
        acc[d] = []
        return acc
    }, {})

    for (const e of entries) {
        if (!byDay[e.day]) byDay[e.day] = []
        byDay[e.day].push(e)
    }

    return (
        <div className="space-y-4">
            {dayOrder.map((d) => (
                <div key={d}>
                    <h4 className="mb-2 text-sm font-semibold">{dayLabels[d]}</h4>
                    <div className="grid gap-2">
                        {(byDay[d] ?? []).map((e) => (
                            <div key={e.id} className="flex items-center justify-between rounded border p-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{e.subject}</span>
                                    <span className="text-xs" style={{ color: "var(--muted)" }}>{e.room}</span>
                                </div>
                                <div className="text-sm" style={{ color: "var(--muted)" }}>{e.time}</div>
                            </div>
                        ))}
                        {(byDay[d] ?? []).length === 0 && <div className="text-xs" style={{ color: "var(--muted)" }}>Khong co lich.</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}
