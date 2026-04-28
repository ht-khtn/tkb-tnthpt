'use client'

import { useEffect } from 'react'
import { applyTheme, getStoredTkbSelection, isPinkTheme, TKB_STORAGE_CLASS_KEY, TKB_STORAGE_STUDENT_KEY } from '@/app/lib/theme'

export default function ThemeSync() {
    useEffect(() => {
        const syncThemeFromStorage = () => {
            const { classId, studentId } = getStoredTkbSelection()
            const isPink = isPinkTheme(classId, studentId)
            applyTheme(isPink)
        }

        syncThemeFromStorage()
        window.addEventListener('storage', syncThemeFromStorage)

        return () => {
            window.removeEventListener('storage', syncThemeFromStorage)
        }
    }, [])

    return null
}
