'use client'

import { useEffect, useRef } from 'react'

export default function AggressiveCLSOptimizer() {
    const observerRef = useRef(null)
    const layoutShiftsRef = useRef([])

    useEffect(() => {
        // Temporarily disabled to prevent hydration mismatches
        return
        // Aggressive CLS prevention
        const preventAllLayoutShifts = () => {
            // Reserve space for ALL images before they load
            const allImages = document.querySelectorAll('img')
            allImages.forEach(img => {
                if (!img.complete) {
                    // Set explicit dimensions if not present
                    if (!img.style.width && !img.style.height) {
                        img.style.width = '100%'
                        img.style.height = 'auto'
                        img.style.aspectRatio = '4/5'
                    }
                    // Add containment
                    img.style.contain = 'layout'
                    // Add intrinsic size
                    img.style.containIntrinsicSize = '400px 500px'
                }
            })

            // Reserve space for ALL dynamic content
            const dynamicElements = document.querySelectorAll('[class*="animate-"], [class*="transition-"]')
            dynamicElements.forEach(element => {
                element.style.contain = 'layout'
                element.style.containIntrinsicSize = 'auto 0'
            })

            // Fix ALL grid layouts
            const gridElements = document.querySelectorAll('[class*="grid"]')
            gridElements.forEach(grid => {
                grid.style.contain = 'layout'
                // Reserve space for grid items
                const gridItems = grid.children
                Array.from(gridItems).forEach(item => {
                    item.style.contain = 'layout'
                    item.style.containIntrinsicSize = 'auto 0'
                })
            })

            // Fix ALL flex layouts
            const flexElements = document.querySelectorAll('[class*="flex"]')
            flexElements.forEach(flex => {
                flex.style.contain = 'layout'
                // Reserve space for flex items
                const flexItems = flex.children
                Array.from(flexItems).forEach(item => {
                    item.style.contain = 'layout'
                    item.style.containIntrinsicSize = 'auto 0'
                })
            })

            // Reserve space for ALL text content
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div')
            textElements.forEach(element => {
                if (element.textContent.trim()) {
                    element.style.contain = 'layout style'
                    // Reserve minimum height based on font size
                    const fontSize = window.getComputedStyle(element).fontSize
                    const lineHeight = window.getComputedStyle(element).lineHeight
                    const minHeight = parseInt(fontSize) * 1.2
                    element.style.minHeight = `${minHeight}px`
                }
            })

            // Fix ALL buttons and links
            const interactiveElements = document.querySelectorAll('button, a')
            interactiveElements.forEach(element => {
                element.style.contain = 'layout style'
                element.style.containIntrinsicSize = 'auto 40px'
            })
        }

        // Monitor for layout shifts
        const measureLayoutShift = () => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                            layoutShiftsRef.current.push(entry)
                        }
                    }
                })
                observer.observe({ entryTypes: ['layout-shift'] })
                return observer
            }
            return null
        }

        // Apply fixes immediately
        preventAllLayoutShifts()

        // Set up MutationObserver for dynamic content
        const mutationObserver = new MutationObserver((mutations) => {
            let shouldReapply = false
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldReapply = true
                }
            })
            if (shouldReapply) {
                setTimeout(preventAllLayoutShifts, 0)
            }
        })

        // Start observing
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        })

        // Start layout shift monitoring
        const shiftObserver = measureLayoutShift()

        // Apply fixes on load
        const handleLoad = () => {
            preventAllLayoutShifts()
            setTimeout(preventAllLayoutShifts, 100)
        }

        window.addEventListener('load', handleLoad)
        window.addEventListener('resize', preventAllLayoutShifts)

        return () => {
            mutationObserver.disconnect()
            shiftObserver?.disconnect()
            window.removeEventListener('load', handleLoad)
            window.removeEventListener('resize', preventAllLayoutShifts)
        }
    }, [])

    return null
}
