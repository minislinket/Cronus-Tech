<template>
    <div class="lightbox" v-if="active">
        <font-awesome-icon class="loading-icon" :style="{ color: 'rgb('+r+','+g+','+b+')' }" :icon="['fa', 'circle-notch']" size="lg" spin />
        <!-- {{ 'r: '+r+', g: '+g+', b: '+b}} -->
    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {


    data() {
        return {
            interval: '',
            r: 70,
            g: 180,
            b: 100,
            countingBUp: true,
            countingGUp: true
        }
    },



    computed: {
        ...mapGetters({
            active: ['Loading/loading']
        })
    },




    watch: {
        active: {
            handler: function() {
                if(this.active === true)
                {
                    this.setRandomColor();
                    clearInterval(this.interval)
                    this.interval = setInterval(() => {
                        this.setRandomColor();
                    }, 10);
                    
                }
                else
                    clearInterval(this.interval);
            },
            deep: true
        }
    },




    methods: {

        setRandomColor: function() {

            if(this.b >= 255)
                this.countingBUp = false;
            else if(this.b <= 50)
                this.countingBUp = true;

            if(this.countingBUp)
                this.b++;
            else if(!this.countingBUp)
                this.b--;

        }

    }

}
</script>



<style>





.lightbox {
    z-index: 900;

    position: fixed;
    top: 0;
    left: 0;
    height: calc(100vh - 65px);
    width: 100vw;
    background: rgba(0,0,0,0.65);

    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 100px;
}


.loading-icon {
    font-size: 70px;
    color: rgb(12, 172, 221);
    transition: color 400ms;
}

</style>