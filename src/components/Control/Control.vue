<template>
    <div class="lightbox" v-if="active || checkingForUpdates || resettingApp || syncingJobData">
        <div class="checking-for-updates-wrap" :class="{ fade : active }" v-if="checkingForUpdates">
            <p>Checking for updates, please wait...</p>
        </div>
        <div class="installing-updates-wrap" v-if="active">
            <h2>Installing Update...</h2>
            <p>Your app might flash during installation.</p>
            <font-awesome-icon class="loading-icon" :style="{ color: 'rgb('+r+','+g+','+b+')' }" :icon="['fa', 'circle-notch']" size="lg" spin />
        </div>


        <div class="resetting-app-wrap" v-if="resettingApp">
            <h2>Resetting your App. Please wait...</h2>
        </div>

        <div class="syncing-job-data-wrap" v-if="syncingJobData">
            <h2>Syncing Job Data with the server, please wait...</h2>
        </div>
        
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
            active: ['Control/updating'],
            checkingForUpdates: ['Control/checkingForUpdates'],
            resettingApp: ['Control/resettingApp'],
            syncingJobData: ['Control/syncingJobData']
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
    z-index: 1500;

    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background: rgba(0,0,0,0.65);

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding-bottom: 100px;
}


.loading-icon {
    font-size: 70px;
    color: rgb(12, 172, 221);
    transition: color 400ms;
}



.checking-for-updates-wrap.fade {
    background: transparent;
}

.checking-for-updates-wrap.fade p {
    color: transparent
}

</style>