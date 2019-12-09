import {
    addClassName,
    removeClassName
} from '../lib.js'

/**
 * TinySwiper plugin for image lazy loading.
 *
 * @param {*} tinyswiper
 */
export default function TinySwiperPluginLazyload (tinyswiper) {
    const { config } = tinyswiper

    if (!config.lazyload) return

    tinyswiper.lazyload = {
        load (index) {
            const $slide = tinyswiper.$list[index]

            if (!$slide) return

            const $imgs = [].slice.call($slide.getElementsByClassName(config.lazyload.elementClass))
            const $preloaders = [].slice.call($slide.getElementsByClassName(config.lazyload.preloaderClass))

            function handleLoaded ($img) {
                $img.removeAttribute('data-src')
                addClassName($img, [ config.lazyload.loadedClass ])
                removeClassName($img, [ config.lazyload.loadingClass ])
                $img.onloaded = null
                $img.onerror = null
                $img.isLoaded = true

                if ($imgs.every(item => item.isLoaded)) {
                    $preloaders.forEach($preloader => {
                        $preloader.parentElement.removeChild($preloader)
                    })
                }
            }

            $imgs.forEach($img => {
                if (!$img.hasAttribute('data-src')) return

                const src = $img.getAttribute('data-src')

                addClassName($img, [ config.lazyload.loadingClass ])
                removeClassName($img, [ config.lazyload.loadedClass ])
                $img.src = src
                $img.onload = () => handleLoaded($img)
                $img.onerror = () => handleLoaded($img)
            })
        },

        loadRange (index, range) {
            tinyswiper.lazyload.load(index)

            if (config.lazyload.loadPrevNext && range >= 1) {
                for (let i = 1; i <= range; i++) {
                    tinyswiper.lazyload.load(index + i)
                    tinyswiper.lazyload.load(index - i)
                }
            }
        }
    }

    tinyswiper.on('before-init', () => {
        config.lazyload = {
            loadPrevNext: false,
            loadPrevNextAmount: 1,
            loadOnTransitionStart: false,
            elementClass: 'swiper-lazy',
            loadingClass: 'swiper-lazy-loading',
            loadedClass: 'swiper-lazy-loaded',
            preloaderClass: 'swiper-lazy-preloader',
            ...config.lazyload
        }
    })

    if (config.lazyload.loadOnTransitionStart) {
        tinyswiper.on('before-slide', function (oldIndex, instance, newIndex) {
            tinyswiper.lazyload.loadRange(newIndex, config.lazyload.loadPrevNextAmount)
        })
    } else {
        tinyswiper.on('after-slide', function (index, instance) {
            tinyswiper.lazyload.loadRange(index, config.lazyload.loadPrevNextAmount)
        })
    }

    tinyswiper.on('after-destroy', tinyswiper => {
        const { config } = tinyswiper

        if (!config.lazyload) return
        delete tinyswiper.lazyload
    })
}