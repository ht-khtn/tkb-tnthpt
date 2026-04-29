'use client'

import { useEffect, useRef, useState } from 'react'

type WidgetPosition = {
    x: number
    y: number
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

const STORAGE_KEY = 'feedback-widget-position'
const MARGIN = 16
const BUTTON_SIZE = 72
const PANEL_GAP = 12
const PANEL_WIDTH = 360
const PANEL_HEIGHT = 300
const DRAG_THRESHOLD = 6

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export default function FeedbackWidget() {
    const [isMounted, setIsMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState<WidgetPosition | null>(null)
    const [feedback, setFeedback] = useState('')
    const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
    const [statusMessage, setStatusMessage] = useState('')
    const dragRef = useRef<{
        pointerId: number
        startX: number
        startY: number
        originX: number
        originY: number
        moved: boolean
    } | null>(null)
    const ignoreClickRef = useRef(false)

    const widgetWidth = isOpen ? Math.max(BUTTON_SIZE, PANEL_WIDTH) : BUTTON_SIZE
    const widgetHeight = isOpen ? BUTTON_SIZE + PANEL_GAP + PANEL_HEIGHT : BUTTON_SIZE

    useEffect(() => {
        const loadPosition = () => {
            const fallbackX = Math.max(MARGIN, window.innerWidth - BUTTON_SIZE - MARGIN)
            const fallbackY = Math.max(MARGIN, window.innerHeight - BUTTON_SIZE - MARGIN)

            try {
                const raw = window.localStorage.getItem(STORAGE_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw) as Partial<WidgetPosition>
                    const { x, y } = parsed
                    if (typeof x === 'number' && typeof y === 'number') {
                        window.requestAnimationFrame(() => {
                            setPosition({
                                x: clamp(x, MARGIN, Math.max(MARGIN, window.innerWidth - BUTTON_SIZE - MARGIN)),
                                y: clamp(y, MARGIN, Math.max(MARGIN, window.innerHeight - BUTTON_SIZE - MARGIN)),
                            })
                            setIsMounted(true)
                        })
                        return
                    }
                }
            } catch {
                // Ignore malformed persisted state.
            }

            window.requestAnimationFrame(() => {
                setPosition({ x: fallbackX, y: fallbackY })
                setIsMounted(true)
            })
        }

        const frameId = window.requestAnimationFrame(loadPosition)
        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [])

    useEffect(() => {
        if (!position) {
            return
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
    }, [position])

    if (!isMounted || !position) {
        return null
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
        if (event.button !== 0) {
            return
        }

        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: position.x,
            originY: position.y,
            moved: false,
        }

        event.currentTarget.setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) {
            return
        }

        const deltaX = event.clientX - drag.startX
        const deltaY = event.clientY - drag.startY

        if (!drag.moved && (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)) {
            drag.moved = true
        }

        if (!drag.moved) {
            return
        }

        const maxX = Math.max(MARGIN, window.innerWidth - widgetWidth - MARGIN)
        const maxY = Math.max(MARGIN, window.innerHeight - widgetHeight - MARGIN)

        setPosition({
            x: clamp(drag.originX + deltaX, MARGIN, maxX),
            y: clamp(drag.originY + deltaY, MARGIN, maxY),
        })
    }

    const finishPointerInteraction = (event: React.PointerEvent<HTMLElement>) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) {
            return
        }

        ignoreClickRef.current = drag.moved
        dragRef.current = null
    }

    const handleClick = () => {
        if (ignoreClickRef.current) {
            ignoreClickRef.current = false
            return
        }

        setSubmissionState('idle')
        setStatusMessage('')
        setIsOpen((current) => !current)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const content = feedback.trim()
        if (!content) {
            setSubmissionState('error')
            setStatusMessage('Vui lòng nhập góp ý trước khi gửi.')
            return
        }

        setSubmissionState('submitting')
        setStatusMessage('')

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            })

            const payload = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(payload?.error ?? 'Không thể lưu góp ý vào hệ thống.')
            }

            setFeedback('')
            setSubmissionState('success')
            setStatusMessage('Cảm ơn bạn, góp ý đã được gửi thành công.')
        } catch (error) {
            setSubmissionState('error')
            setStatusMessage(error instanceof Error ? error.message : 'Không thể gửi góp ý.')
        }
    }

    return (
        <div
            className="fixed z-30"
            style={{
                left: `clamp(${MARGIN}px, ${position.x}px, calc(100vw - ${widgetWidth}px - ${MARGIN}px))`,
                top: `clamp(${MARGIN}px, ${position.y}px, calc(100vh - ${widgetHeight}px - ${MARGIN}px))`,
                width: `${widgetWidth}px`,
                height: `${widgetHeight}px`,
            }}
        >
            <button
                type="button"
                className="group absolute left-0 top-0 flex h-18 w-18 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_18px_40px_var(--shadow)] transition duration-300 hover:-translate-y-0.5"
                style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    color: 'var(--surface)',
                    borderColor: 'color-mix(in srgb, var(--surface) 30%, var(--accent))',
                }}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Đóng hộp góp ý' : 'Mở hộp góp ý'}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointerInteraction}
                onPointerCancel={finishPointerInteraction}
                onClick={handleClick}
            >
                {isOpen ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                    </svg>
                ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 18.5V20l2.7-1.5" />
                        <path d="M6 6.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H11l-4.5 2.5V15.5H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 rounded-[1.4rem] border p-4 shadow-[0_24px_70px_var(--shadow)]"
                    style={{
                        top: `${BUTTON_SIZE + PANEL_GAP}px`,
                        width: `${PANEL_WIDTH}px`,
                        background: 'color-mix(in srgb, var(--surface) 96%, transparent)',
                        borderColor: 'var(--stroke)',
                        backdropFilter: 'blur(16px)',
                    }}
                    role="dialog"
                    aria-label="Hộp góp ý"
                >
                    <div
                        className="mb-3 flex cursor-move items-center justify-between gap-3 select-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={finishPointerInteraction}
                        onPointerCancel={finishPointerInteraction}
                    >
                        <div>
                            <p className="font-display text-lg font-semibold">Hãy ghi góp ý của bạn ở đây</p>
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                Góp ý sẽ được lưu vào bảng feedbacks.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="rounded-full border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5"
                            style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--ink)' }}
                            onClick={() => setIsOpen(false)}
                        >
                            Đóng
                        </button>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <textarea
                            className="min-h-28 w-full rounded-2xl border px-3 py-2 text-sm outline-none transition focus:border-(--accent)"
                            style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--stroke)',
                                color: 'var(--ink)',
                            }}
                            value={feedback}
                            onChange={(event) => setFeedback(event.target.value)}
                            placeholder="Nhập ý kiến, lỗi gặp phải hoặc đề xuất cải thiện..."
                            maxLength={2000}
                        />

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                {feedback.length}/2000 ký tự
                            </p>
                            <button
                                type="submit"
                                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ background: 'var(--accent)' }}
                                disabled={submissionState === 'submitting'}
                            >
                                {submissionState === 'submitting' ? 'Đang gửi...' : 'Gửi góp ý'}
                            </button>
                        </div>

                        {statusMessage && (
                            <p
                                className="rounded-2xl border px-3 py-2 text-sm"
                                style={{
                                    borderColor: submissionState === 'error' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(20, 184, 166, 0.24)',
                                    background: submissionState === 'error' ? 'rgba(220, 38, 38, 0.08)' : 'var(--accent-soft)',
                                    color: submissionState === 'error' ? '#b91c1c' : 'var(--ink)',
                                }}
                            >
                                {statusMessage}
                            </p>
                        )}
                    </form>
                </div>
            )}
        </div>
    )
}