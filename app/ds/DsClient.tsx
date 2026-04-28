'use client'

import React, { useMemo, useState } from 'react'
import { classes, students, extraSubjects, classSchedules } from '@/app/lib/timetableData'

export default function DsClient() {
    const [mode, setMode] = useState<'class' | 'subject'>('class')
    const [classId, setClassId] = useState<string | null>(null)
    const [subject, setSubject] = useState<string | null>(null)

    const subjectsFromClasses = useMemo(() => {
        const set = new Set<string>()
        Object.values(classSchedules).forEach((arr) => arr.forEach((e) => set.add(e.subject)))
        return Array.from(set).sort()
    }, [])

    const allSubjects = useMemo(() => [...subjectsFromClasses, ...extraSubjects].filter(Boolean), [subjectsFromClasses])

    const resultStudents = useMemo(() => {
        if (mode === 'class') {
            if (!classId) return []
            return students.filter((s) => s.classId === classId)
        }
        if (mode === 'subject') {
            if (!subject) return []
            // students who have subject in extraSubjects OR whose class has that subject
            const classHas = (cid: string) => (classSchedules[cid] ?? []).some((e) => e.subject === subject)
            return students.filter((s) => s.extraSubjects.includes(subject) || classHas(s.classId))
        }
        return []
    }, [mode, classId, subject])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded app-bg-surface p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={mode === 'class'} onChange={() => setMode('class')} />
                        <span className="ml-1">Chon theo lop</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={mode === 'subject'} onChange={() => setMode('subject')} />
                        <span className="ml-1">Chon theo mon</span>
                    </label>
                </div>

                {mode === 'class' && (
                    <div>
                        <label className="block text-sm font-semibold">Chon lop</label>
                        <select className="w-full rounded border px-3 py-2" value={classId ?? ''} onChange={(e) => setClassId(e.target.value || null)}>
                            <option value="">-- Chon lop --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'subject' && (
                    <div>
                        <label className="block text-sm font-semibold">Chon mon</label>
                        <select className="w-full rounded border px-3 py-2" value={subject ?? ''} onChange={(e) => setSubject(e.target.value || null)}>
                            <option value="">-- Chon mon --</option>
                            {Array.from(new Set(allSubjects)).map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="rounded app-bg-surface p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold">Ket qua</h3>
                {resultStudents.length === 0 && <p className="text-sm app-text-muted">Khong co ket qua.</p>}
                <ul className="space-y-2">
                    {resultStudents.map((s) => (
                        <li key={s.id} className="flex items-center justify-between rounded border p-2">
                            <div>
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs app-text-muted">{s.classId}</div>
                            </div>
                            <div className="text-xs app-text-muted">{s.extraSubjects.join(', ')}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
