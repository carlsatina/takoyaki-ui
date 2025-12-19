<template>
    <teleport to="body">
        <transition name="fade" appear>
            <div class="backdrop" tabindex="0" aria-live="polite" aria-label="Loading">
                <div class="loader">
                    <div class="steam">
                        <span class="steam-line"></span>
                        <span class="steam-line"></span>
                        <span class="steam-line"></span>
                    </div>
                    <div class="pan">
                        <span class="takoyaki"></span>
                        <span class="takoyaki"></span>
                        <span class="takoyaki"></span>
                    </div>
                    <p class="label">Cooking your order…</p>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script>
export default {
    name: 'Loading',
}
</script>

<style lang="scss" scoped>
.backdrop {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 45%),
                radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1), transparent 40%),
                rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    z-index: 999;
}

.loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 24px 26px 20px;
    border-radius: 18px;
    background: linear-gradient(145deg, #101820, #172735);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06);
    color: #e8f2ff;
}

.pan {
    position: relative;
    width: 210px;
    height: 90px;
    background: linear-gradient(180deg, #1f2e3d, #0f1822);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.35);
}

.takoyaki {
    position: absolute;
    bottom: 14px;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #f7d79b, #d99b5d 60%, #b26b2b 100%);
    box-shadow: inset 0 -6px 10px rgba(0, 0, 0, 0.25);
    animation: bob 1.2s ease-in-out infinite;

    &:nth-child(1) {
        left: 16px;
        animation-delay: 0s;
    }

    &:nth-child(2) {
        left: 78px;
        animation-delay: 0.2s;
    }

    &:nth-child(3) {
        left: 140px;
        animation-delay: 0.4s;
    }
}

.steam {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    height: 40px;
}

.steam-line {
    display: inline-block;
    width: 4px;
    height: 40px;
    border-radius: 50px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
    animation: rise 1.6s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
}

.label {
    margin: 0;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: #e6f1ff;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes rise {
    0% { opacity: 0; transform: translateY(12px) scaleY(0.6); }
    40% { opacity: 1; transform: translateY(-6px) scaleY(1); }
    100% { opacity: 0; transform: translateY(-26px) scaleY(0.6); }
}
</style>
