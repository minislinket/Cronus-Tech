<template>
    <div class="calls-section-loading">
        <font-awesome-icon class="calls-section-loading-icon" :icon="['fa','circle-notch']" size="lg" spin />
    </div>
</template>



<script>
export default {

}
</script>



<style>


.calls-section-loading {
    position: absolute;
    width: 100%;
    min-height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 900;
}



.calls-section-loading-icon {
    position: fixed;
    top: 35%;
    left: 0;
    right: 0;
    margin: 0 auto;

    font-size: 50px;
    color: var(--BlueLight);
}

</style>