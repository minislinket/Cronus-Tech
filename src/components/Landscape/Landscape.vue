<template>
    <div class="landscape-wrap">
        <h2>Please rotate your device back to portrait orientation</h2>
        <font-awesome-icon class="landscape-rotate-icon" :icon="['fa', 'sync-alt']" size="lg" />
    </div>
</template>



<script>
export default {

}
</script>



<style>


.landscape-wrap {
    position: fixed;
    background: var(--BlueDark);
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1800;
}



.landscape-wrap h2 {
   /*  transform: rotate(-90deg); */
    
}



.landscape-rotate-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%) scale(10);
    color: rgba(255,255,255,0.2);
}
</style>