'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getClasses, getStudents, getClassTimetable, getStudentExtraSubjects, getExtraSubjectTimetable } from '@/app/lib/supabase-api'
import { mapPeriodToTime, mapWeekday, ScheduleEntry } from '@/app/lib/db-helpers'
import TimetableView from '@/app/components/TimetableView'
import { applyTheme, isPinkTheme, TKB_STORAGE_CLASS_KEY, TKB_STORAGE_STUDENT_KEY } from '@/app/lib/theme'

export default function TkbClient() {
    const fullscreenRef = useRef<HTMLDivElement>(null)
    const [classes, setClasses] = useState<Array<{ name: string; homeroom_teacher: string }>>([])
    const [students, setStudents] = useState<Array<{ id: number; name: string; class: string }>>([])
    const [classId, setClassId] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return null
        }

        return window.localStorage.getItem(TKB_STORAGE_CLASS_KEY)
    })
    const [studentId, setStudentId] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return null
        }

        return window.localStorage.getItem(TKB_STORAGE_STUDENT_KEY)
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [classEntries, setClassEntries] = useState<ScheduleEntry[]>([])
    const [extraEntries, setExtraEntries] = useState<ScheduleEntry[]>([])
    const [isFullscreen, setIsFullscreen] = useState(false)

    const selectedStudentName = useMemo(() => {
        if (!studentId) {
            return null
        }

        return students.find((student) => String(student.id) === studentId)?.name ?? null
    }, [studentId, students])

    const composed = useMemo(() => [...classEntries, ...extraEntries], [classEntries, extraEntries])

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false)
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const handleExpandFullscreen = async () => {
        if (fullscreenRef.current) {
            try {
                await fullscreenRef.current.requestFullscreen()
                setIsFullscreen(true)
            } catch (err) {
                console.error('Failed to enter fullscreen:', err)
            }
        }
    }

    const handleExitFullscreen = async () => {
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen()
                setIsFullscreen(false)
            } catch (err) {
                console.error('Failed to exit fullscreen:', err)
            }
        }
    }

    // Persist selection after hydration.
    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        if (classId) {
            window.localStorage.setItem(TKB_STORAGE_CLASS_KEY, classId)
        } else {
            window.localStorage.removeItem(TKB_STORAGE_CLASS_KEY)
        }

        if (studentId) {
            window.localStorage.setItem(TKB_STORAGE_STUDENT_KEY, studentId)
        } else {
            window.localStorage.removeItem(TKB_STORAGE_STUDENT_KEY)
        }
    }, [classId, studentId])

    // Apply the pink easter egg theme when the exact class and student are selected.
    useEffect(() => {
        applyTheme(isPinkTheme(classId, selectedStudentName))
    }, [classId, selectedStudentName])

    // Load initial data (classes only)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const classesData = await getClasses()
                setClasses(classesData)
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
                setClassEntries([])
                setExtraEntries([])
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

    // Fetch class timetable whenever class changes
    useEffect(() => {
        let isCancelled = false

        const loadClassSchedule = async () => {
            if (!classId) {
                setClassEntries([])
                setExtraEntries([])
                return
            }
            try {
                setError(null)
                const classData = await getClassTimetable(classId)
                const baseEntries: ScheduleEntry[] = (classData as Array<{ id: number; weekday: string; period_no: number; subject_name: string; class_name: string }>).map((item) => ({
                    id: `class-${item.id}`,
                    day: mapWeekday(item.weekday),
                    periodNo: item.period_no,
                    subject: item.subject_name,
                    room: item.class_name,
                    type: 'class',
                    time: mapPeriodToTime(),
                }))

                if (!isCancelled) {
                    setClassEntries(baseEntries)
                    setExtraEntries([])
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to compose schedule')
                }
            }
        }
        loadClassSchedule()

        return () => {
            isCancelled = true
        }
    }, [classId])

    // Load student extra subject timetable after class timetable is ready
    useEffect(() => {
        let isCancelled = false

        const loadStudentSchedule = async () => {
            if (!classId || !studentId) {
                setExtraEntries([])
                return
            }

            try {
                setError(null)
                const studentSubjects = await getStudentExtraSubjects(parseInt(studentId, 10))
                const subjectNames = Array.from(
                    new Set(
                        (studentSubjects as Array<{ subject_name: string }>)
                            .map(s => s.subject_name)
                            .filter(Boolean),
                    ),
                )

                const mergedExtras: ScheduleEntry[] = []

                for (const subjectName of subjectNames) {
                    const extraData = await getExtraSubjectTimetable(subjectName)
                        ; (extraData as Array<{ id: number; weekday: string; period_no: number; subject_name: string; location: string }>).forEach((item) => {
                            mergedExtras.push({
                                id: `extra-${item.id}`,
                                day: mapWeekday(item.weekday),
                                periodNo: item.period_no,
                                subject: item.subject_name,
                                room: item.location,
                                type: 'extra',
                                time: mapPeriodToTime(),
                            })
                        })
                }

                if (!isCancelled) {
                    setExtraEntries(mergedExtras)
                }
            } catch (err) {
                if (!isCancelled) {
                    setExtraEntries([])
                    setError(err instanceof Error ? err.message : 'Failed to load student schedule')
                }
            }
        }

        loadStudentSchedule()

        return () => {
            isCancelled = true
        }
    }, [classId, studentId])

    return (
        <div className="space-y-6">
            {/* Selection Panel - ẩn khi fullscreen */}
            {!isFullscreen && (
                <div className="rounded-lg p-4 shadow-sm" style={{ background: "var(--surface)" }}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Chọn lớp</label>
                            {loading ? (
                                <p style={{ color: "var(--muted)" }}>Đang tải...</p>
                            ) : (
                                <select
                                    value={classId ?? ''}
                                    onChange={(e) => {
                                        const v = e.target.value || null
                                        setClassId(v)
                                        setStudentId(null)
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
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Chọn học sinh (tùy chọn)</label>
                            <select
                                value={studentId ?? ''}
                                onChange={(e) => setStudentId(e.target.value || null)}
                                disabled={!classId}
                                className="w-full rounded border px-3 py-2 disabled:opacity-60"
                            >
                                <option value="">-- Chọn học sinh --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Timetable */}
            <div
                ref={fullscreenRef}
                className={isFullscreen ? "fixed inset-0 z-50 grid min-h-0 grid-rows-[auto_1fr] overflow-hidden" : "rounded-lg p-4 shadow-sm relative"}
                style={{ background: isFullscreen ? "var(--background)" : "var(--surface)" }}
            >
                <div className={isFullscreen ? "flex items-center justify-between border-b px-4 py-3" : "flex items-center justify-between mb-4"} style={isFullscreen ? { borderColor: "var(--stroke)" } : undefined}>
                    <h3 className="text-lg font-semibold">Thời Khóa Biểu</h3>
                    <button
                        onClick={isFullscreen ? handleExitFullscreen : handleExpandFullscreen}
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:opacity-70 transition"
                        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                        title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isFullscreen ? (
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            ) : (
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            )}
                        </svg>
                    </button>
                </div>
                <div className={isFullscreen ? "min-h-0 overflow-auto px-4 pb-4" : "space-y-3"}>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {!classId && (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>Vui lòng chọn lớp để xem lịch học.</p>
                    )}
                    {classId && <TimetableView entries={composed} />}
                </div>
            </div>
        </div>
    )
}
