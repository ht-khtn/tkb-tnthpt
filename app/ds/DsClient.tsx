'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { getClasses, getStudents, getAllSubjects, getStudentsBySubject } from '@/app/lib/supabase-api'

interface Student {
    id: number
    name: string
    class: string
}

export default function DsClient() {
    const [classes, setClasses] = useState<Array<{ name: string; homeroom_teacher: string }>>([])
    const [allStudents, setAllStudents] = useState<Student[]>([])
    const [subjects, setSubjects] = useState<string[]>([])
    const [mode, setMode] = useState<'class' | 'subject'>('class')
    const [classId, setClassId] = useState<string | null>(null)
    const [subject, setSubject] = useState<string | null>(null)
    const [subjectStudentIds, setSubjectStudentIds] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [classesData, subjectsData] = await Promise.all([
                    getClasses(),
                    getAllSubjects(),
                ])
                setClasses(classesData)
                setSubjects(subjectsData.map((s: { name: string }) => s.name))

                // Load all students
                const allStudentsData = await getStudents()
                setAllStudents(allStudentsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Load students for selected subject
    useEffect(() => {
        if (mode === 'subject' && subject) {
            const loadSubjectStudents = async () => {
                try {
                    const studentIds = await getStudentsBySubject(subject)
                    setSubjectStudentIds(studentIds)
                } catch (err) {
                    console.error('Failed to load students by subject:', err)
                    setSubjectStudentIds([])
                }
            }
            loadSubjectStudents()
        } else {
            setSubjectStudentIds([])
        }
    }, [subject, mode])

    // Filter students based on mode and selection
    const resultStudents = useMemo(() => {
        if (mode === 'class') {
            if (!classId) return []
            return allStudents.filter((s) => s.class === classId)
        }
        if (mode === 'subject') {
            if (!subject || subjectStudentIds.length === 0) return []
            return allStudents.filter((s) => subjectStudentIds.includes(s.id))
        }
        return []
    }, [mode, classId, subject, allStudents, subjectStudentIds])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <div className="mb-3 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={mode === 'class'} onChange={() => { setMode('class'); setClassId(null); setSubject(null) }} />
                        <span className="ml-1">Chọn theo lớp</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={mode === 'subject'} onChange={() => { setMode('subject'); setClassId(null); setSubject(null) }} />
                        <span className="ml-1">Chọn theo môn</span>
                    </label>
                </div>

                {mode === 'class' && (
                    <div>
                        <label className="block text-sm font-semibold">Chọn lớp</label>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={classId ?? ''}
                            onChange={(e) => setClassId(e.target.value || null)}
                            disabled={loading}
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'subject' && (
                    <div>
                        <label className="block text-sm font-semibold">Chọn môn</label>
                        <select
                            className="w-full rounded border px-3 py-2"
                            value={subject ?? ''}
                            onChange={(e) => setSubject(e.target.value || null)}
                            disabled={loading}
                        >
                            <option value="">-- Chọn môn --</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="rounded p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <h3 className="mb-3 text-lg font-semibold">Kết quả</h3>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {loading ? (
                    <p style={{ color: "var(--muted)" }}>Đang tải...</p>
                ) : (
                    <>
                        {(!classId && !subject) && <p className="text-sm" style={{ color: "var(--muted)" }}>Vui lòng chọn lớp hoặc môn.</p>}
                        {((classId || subject) && resultStudents.length === 0) && <p className="text-sm" style={{ color: "var(--muted)" }}>Không có kết quả.</p>}
                        <ul className="space-y-2">
                            {resultStudents.map((s) => (
                                <li key={s.id} className="flex items-center justify-between rounded border p-2" style={{ borderColor: "var(--stroke)" }}>
                                    <div>
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-xs" style={{ color: "var(--muted)" }}>{s.class}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}
