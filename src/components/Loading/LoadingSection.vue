<template>
    <div class="section-loading">
        <font-awesome-icon class="section-loading-icon" :icon="['fa','circle-notch']" size="lg" spin />
    </div>
</template>



<script>
export default {

}
</script>



<style>


.section-loading {
    position: absolute;
    width: 100%;
    min-height: 100%;
    background: rgba(0,0,0,0.6);
}



.section-loading-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;

    font-size: 50px;
    color: var(--BlueLight)
}

</style>