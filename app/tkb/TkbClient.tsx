'use client'

import React, { useMemo, useState } from 'react'
import {
    classes,
    classSchedules,
    students,
    extraSubjects,
    extraSubjectSchedules,
    dayOrder,
    ScheduleEntry,
} from '@/app/lib/timetableData'
import TimetableView from '@/app/components/TimetableView'

export default function TkbClient() {
    const [classId, setClassId] = useState<string | null>(null)
    const [studentId, setStudentId] = useState<string | null>(null)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])

    const studentsForClass = useMemo(() => {
        if (!classId) return []
        return students.filter((s) => s.classId === classId)
    }, [classId])

    const composed: ScheduleEntry[] = useMemo(() => {
        if (!classId) return []

        const classTkb: ScheduleEntry[] = classSchedules[classId] ?? []

        if (!studentId) return classTkb

        const student = students.find((s) => s.id === studentId)
        if (!student) return classTkb

        // start with class timetable
        const merged: ScheduleEntry[] = [...(classSchedules[student.classId] ?? [])]

        // include selected extra subjects (from selectedExtras)
        for (const sub of selectedExtras) {
            const arr = extraSubjectSchedules[sub]
            if (arr) merged.push(...arr)
        }

        // sort by dayOrder then time (string)
        merged.sort((a, b) => {
            const da = dayOrder.indexOf(a.day)
            const db = dayOrder.indexOf(b.day)
            if (da !== db) return da - db
            return a.time.localeCompare(b.time)
        })

        return merged
    }, [studentId, selectedExtras, classId])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4 rounded-lg p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <label className="block text-sm font-semibold">Chon lop</label>
                <select
                    value={classId ?? ''}
                    onChange={(e) => {
                        const v = e.target.value || null
                        setClassId(v)
                        setStudentId(null)
                        setSelectedExtras([])
                    }}
                    className="w-full rounded border px-3 py-2"
                >
                    <option value="">-- Chon lop --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label className="block text-sm font-semibold">Chon hoc sinh (theo lop)</label>
                <select
                    value={studentId ?? ''}
                    onChange={(e) => setStudentId(e.target.value || null)}
                    disabled={!classId}
                    className="w-full rounded border px-3 py-2 disabled:opacity-60"
                >
                    <option value="">-- Chon hoc sinh --</option>
                    {studentsForClass.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <div>
                    <p className="mb-2 text-sm font-semibold">Mon on (them vao neu can)</p>
                    <div className="flex flex-wrap gap-2">
                        {studentId
                            ? (students.find((x) => x.id === studentId)?.extraSubjects ?? []).map((es) => (
                                <label key={es} className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedExtras.includes(es)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedExtras((p) => [...p, es])
                                            else setSelectedExtras((p) => p.filter((t) => t !== es))
                                        }}
                                    />
                                    <span className="text-sm">{es}</span>
                                </label>
                            ))
                            : extraSubjects.slice(0, 6).map((es) => (
                                <label key={es} className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedExtras.includes(es)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedExtras((p) => [...p, es])
                                            else setSelectedExtras((p) => p.filter((t) => t !== es))
                                        }}
                                    />
                                    <span className="text-sm">{es}</span>
                                </label>
                            ))}
                    </div>
                </div>
            </div>

            <div className="rounded-lg p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <h3 className="mb-3 text-lg font-semibold">Ket qua TKB</h3>
                {(!classId || composed.length === 0) && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Chua co lich de hien thi.</p>
                )}
                {classId && <TimetableView entries={composed} />}
            </div>
        </div>
    )
}
