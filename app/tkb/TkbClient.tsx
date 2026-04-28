'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { getClasses, getStudents, getClassTimetable, getStudentExtraSubjects, getExtraSubjectTimetable, getAllSubjects } from '@/app/lib/supabase-api'
import { mapWeekday, mapPeriodToTime, ScheduleEntry } from '@/app/lib/db-helpers'
import TimetableView from '@/app/components/TimetableView'

export default function TkbClient() {
    const [classes, setClasses] = useState<Array<{ name: string; homeroom_teacher: string }>>([])
    const [students, setStudents] = useState<Array<{ id: number; name: string; class: string }>>([])
    const [extraSubjects, setExtraSubjects] = useState<Array<{ name: string }>>([])
    const [classId, setClassId] = useState<string | null>(null)
    const [studentId, setStudentId] = useState<string | null>(null)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [composed, setComposed] = useState<ScheduleEntry[]>([])

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
                setExtraSubjects(subjectsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Load students when class changes
    useEffect(() => {
        const loadStudents = async () => {
            if (!classId) {
                setStudents([])
                return
            }
            try {
                const data = await getStudents(classId)
                setStudents(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load students')
            }
        }
        loadStudents()
    }, [classId])

    const studentsForClass = useMemo(() => {
        return students
    }, [students])

    // Fetch and compose timetable
    useEffect(() => {
        const composeSchedule = async () => {
            if (!classId) {
                setComposed([])
                return
            }
            try {
                const [classData] = await Promise.all([
                    getClassTimetable(classId),
                    studentId ? getStudentExtraSubjects(parseInt(studentId)) : Promise.resolve([]),
                ])

                const merged: ScheduleEntry[] = []

                    // Add class timetable
                    ; (classData as Array<{ id: number; weekday: string; period_no: number; subject_name: string; class_name: string }>).forEach((item) => {
                        merged.push({
                            id: `class-${item.id}`,
                            day: mapWeekday(item.weekday),
                            time: mapPeriodToTime(item.period_no),
                            subject: item.subject_name,
                            room: item.class_name,
                            type: 'class',
                        })
                    })

                // Add extra subjects if student selected any
                if (studentId && selectedExtras.length > 0) {
                    for (const subject of selectedExtras) {
                        const extraData = await getExtraSubjectTimetable(subject)
                            ; (extraData as Array<{ id: number; weekday: string; period_no: number; subject_name: string; location: string }>).forEach((item) => {
                                merged.push({
                                    id: `extra-${item.id}`,
                                    day: mapWeekday(item.weekday),
                                    time: mapPeriodToTime(item.period_no),
                                    subject: item.subject_name,
                                    room: item.location,
                                    type: 'extra',
                                })
                            })
                    }
                }

                // Sort by day order then time
                const dayOrder: Record<string, number> = {
                    'T2': 0, 'T3': 1, 'T4': 2, 'T5': 3, 'T6': 4, 'T7': 5, 'CN': 6,
                }
                merged.sort((a, b) => {
                    const da = dayOrder[a.day] ?? 0
                    const db = dayOrder[b.day] ?? 0
                    if (da !== db) return da - db
                    return a.time.localeCompare(b.time)
                })

                setComposed(merged)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to compose schedule')
            }
        }
        composeSchedule()
    }, [classId, studentId, selectedExtras])

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4 rounded-lg p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <label className="block text-sm font-semibold">Chọn lớp</label>
                {loading ? (
                    <p style={{ color: "var(--muted)" }}>Đang tải...</p>
                ) : (
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
                        <option value="">-- Chọn lớp --</option>
                        {classes.map((c) => (
                            <option key={c.name} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                )}

                <label className="block text-sm font-semibold">Chọn học sinh (theo lớp)</label>
                <select
                    value={studentId ?? ''}
                    onChange={(e) => setStudentId(e.target.value || null)}
                    disabled={!classId}
                    className="w-full rounded border px-3 py-2 disabled:opacity-60"
                >
                    <option value="">-- Chọn học sinh --</option>
                    {studentsForClass.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <div>
                    <p className="mb-2 text-sm font-semibold">Môn ôn (thêm vào nếu cần)</p>
                    <div className="flex flex-wrap gap-2">
                        {studentId && extraSubjects.length > 0
                            ? extraSubjects.map((es) => (
                                <label key={es.name} className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedExtras.includes(es.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedExtras((p) => [...p, es.name])
                                            else setSelectedExtras((p) => p.filter((t) => t !== es.name))
                                        }}
                                    />
                                    <span className="text-sm">{es.name}</span>
                                </label>
                            ))
                            : extraSubjects.slice(0, 6).map((es) => (
                                <label key={es.name} className="inline-flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedExtras.includes(es.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedExtras((p) => [...p, es.name])
                                            else setSelectedExtras((p) => p.filter((t) => t !== es.name))
                                        }}
                                    />
                                    <span className="text-sm">{es.name}</span>
                                </label>
                            ))}
                    </div>
                </div>
            </div>

            <div className="rounded-lg p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                <h3 className="mb-3 text-lg font-semibold">Kết quả TKB</h3>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {!classId && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Chưa có lịch để hiển thị.</p>
                )}
                {classId && <TimetableView entries={composed} />}
            </div>
        </div>
    )
}
