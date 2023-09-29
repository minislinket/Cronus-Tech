<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="general-comment-modal app-modal-content">


            <div class="general-comment-headers-wrap">
                <h4>{{ call.customerStoreName.substr(0, 25) }}</h4>
                <h4 class="gc-status-heading on-hold">
                    <font-awesome-icon v-if="call.techStateId == 2" class="general-comments-tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                    <font-awesome-icon v-if="call.techStateId == 3" class="general-comments-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                    <font-awesome-icon v-if="call.techStateId == 4" class="general-comments-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                    <font-awesome-icon v-if="call.techStateId == 5" class="general-comments-tech-state-icon returning" style="transform: scaleX(-1); font-size: 16px;" :icon="['fa', 'clock-rotate-left']" size="lg" />
                    <font-awesome-icon v-if="call.techStateId == 6" class="general-comments-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                    <span v-if="call.techStateId == 7" style="font-size: 18px;" class="material-symbols-outlined general-comments-tech-state-icon material rerouted" >alt_route</span>
                    {{ getTechStatusName(call.techStateId) }}
                </h4>
                
            </div>

            <h5 class="gc-for-calls-heading">Commenting on Call: <span>{{ call.id }}</span></h5>

            <div class="general-comment-input-wrap">
                <textarea type="text" placeholder="Add Comment - Do not use this if you have a stock, store or order issue. Please upload a Job Card and place the call On Hold." v-model="comment"></textarea> 
            </div>

            
            <div class="general-comment-btn-wrap">
                <button :disabled="!comment" @click="submitComment()">Submit</button>
                <button class="warning" @click="closeCommentModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import SearchSelect from '../../../components/SearchSelect/SearchSelect.vue';
export default {
  components: { SearchSelect },

    data() {
        return {
            comment: '',
            tech_statuses: JSON.parse(localStorage.getItem('call_tech_states'))
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/generalCommentModal'],
            call: ['Call/call'],
        })
    },




    mounted() {
        this.comment = '';
    },




    methods: {




        getTechStatusName: function(techStateId) {
            return this.tech_statuses.filter(status => status.id === techStateId)[0].name;
        },



        closeCommentModal: function() {
            this.$store.dispatch('Call/generalCommentModal', false);
            this.comment = '';
        },



        submitComment: function() {
            this.$emit('submitGeneralComment', this.comment);
            this.closeCommentModal();
        }

    }

}
</script>


<style>


.app-modal-content.general-comment-modal {
    
    height: 350px;
    width: 90vw;
    padding-bottom: 50px;
    padding-top: 0;
}



.general-comment-modal.active {
    top: 120px;
}




.general-comment-stock-reason-search-select .search-input-wrap input,
.general-comment-stock-reason-search-select .search-results-drop-down-wrap {
    width: 70vw;
}

.general-comment-stock-reason-search-select.array-input-search-wrap h4 {
    text-align: center;
    font-size: 14px;
}





.general-comment-headers-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 -8px;
    padding: 5px 8px;
    margin-bottom: 5px;
    border-bottom: 1px solid var(--OffWhite);
}



.gc-for-calls-heading {
    text-align: left;
    margin-bottom: 15px;
}









.general-comment-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}


.general-comment-input-wrap textarea {
    width: 80%;
    height: 200px;
    padding: 7px 12px;
}













.general-comment-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
    position: absolute;
    width: 100%;
    bottom: 10px;
    left: 0;
    right: 0;
    margin: 0 auto;
}











.gc-status-heading {
    display: flex;
    align-items: center;
    font-size: 14px;
}




.general-comments-tech-state-icon {
    margin-right: 3px;
    font-size: 16px;
}



.general-comments-tech-state-icon.received {
    color: var(--ReceivedLight);
}
.general-comments-tech-state-icon.en-route {
    color: var(--EnRouteLight);
}
.general-comments-tech-state-icon.on-site {
    color: var(--OnSiteLight);
}
.general-comments-tech-state-icon.returning {
    color: var(--ReturningLight);
}
.general-comments-tech-state-icon.on-hold {
    color: var(--OnHoldLight);
}
.general-comments-tech-state-icon.rerouted {
    color: var(--ReroutedLight);
}
</style>