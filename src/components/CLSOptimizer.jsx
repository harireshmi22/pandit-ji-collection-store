'use client'

import { useEffect } from 'react'

export default function CLSOptimizer() {
    useEffect(() => {
        // Prevent CLS from dynamic content
        const preventLayoutShift = () => {
            // Reserve space for images before they load
            const images = document.querySelectorAll('img')
            images.forEach(img => {
                if (!img.complete && !img.style.aspectRatio) {
                    const width = img.getAttribute('width')
                    const height = img.getAttribute('height')
                    if (width && height) {
                        img.style.aspectRatio = `${width}/${height}`
                        img.style.contain = 'layout'
                    }
                }
            })

            // Prevent layout shifts from dynamic content
            const dynamicElements = document.querySelectorAll('[data-dynamic]')
            dynamicElements.forEach(element => {
                element.style.contain = 'layout'
            })

            // Reserve space for lazy loaded content
            const lazyElements = document.querySelectorAll('[loading="lazy"]')
            lazyElements.forEach(element => {
                element.style.containIntrinsicSize = '400px 500px'
            })
        }

        // Run immediately and on DOM changes
        preventLayoutShift()
        
        // Observe DOM changes to prevent CLS from dynamic content
        const observer = new MutationObserver(() => {
            preventLayoutShift()
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        })

        return () => observer.disconnect()
    }, [])

    return null
}
