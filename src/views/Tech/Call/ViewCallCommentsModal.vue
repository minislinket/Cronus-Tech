<template>
    <div class="view-call-comments-modal-wrap" v-if="active">

        <h3>Call Comments</h3>

        <div class="view-call-comments-grid-scroll-section" v-if="callComments.length >= 1 && !loading">
            <template v-for="comment in callComments" :key="comment.id">
                <div class="view-call-comment-card">
                    <div class="view-call-comment-card-header">
                        <p>{{ comment.time }}</p>
                        <p :class="{ 'resolved' : comment.resolved, 'unresolved' : !comment.resolved }">Resolved: {{ comment.resolved ? 'Yes' : 'No' }}</p>
                    </div>
                    <p v-html="comment.comment"></p>
                </div>
            </template>
        </div>

        <font-awesome-icon v-if="loading" class="loading-view-call-comments-icon" :icon="['fa','circle-notch']" size="lg" spin />

        <button class="view-call-comment-close-btn" @click="$store.dispatch('Call/viewCallCommentsModalActive', false)">Close</button>
    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {


    data() {
        return {
            
        }
    },


    computed: {
        ...mapGetters({
            active: ['Call/viewCallCommentsModalActive'],
            loading: ['Call/loadingCallComments'],
            callComments: ['Call/callComments']
        })
    },




    watch: {

    },




    methods: {

    }

}
</script>



<style>

.view-call-comments-modal-wrap {
    position: fixed;
    height: 40vh;
    max-height: 65vh;
    width: 95vw;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;

    padding: 10px;
    padding-bottom: 55px;
    background: var(--GunMetal);
    overflow-y: hidden;
    z-index: 900;
}


.view-call-comments-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
    display: flex;
    flex-direction: column;
}










.view-call-comments-grid-scroll-section {
    height: 85%;
    overflow-y: scroll;
    margin-bottom: 20px;
}



.view-call-comment-card {
    background: var(--EnRouteDark);
    margin-bottom: 25px;
    border-radius: 3px;
}

.view-call-comment-card-header {
    display: flex;
    justify-content: space-between;
    padding: 4px 5px;
    background: var(--OffWhite);
    color: var(--TextBlack);
    margin-bottom: 10px;
    box-shadow: 0 4px 12px 0 rgba(0,0,0,0.2);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    font-weight: 700;
}

.view-call-comment-card-header p.resolved {
    color: var(--OkayGreen);
}

.view-call-comment-card-header p.unresolved {
    color: var(--WarningRed);
}

.view-call-comment-card p {
    padding: 0 10px;
    padding-bottom: 8px;
}

.view-call-comment-card-header p {
    padding-bottom: 0;
}





.view-call-comments-modal-wrap .view-call-comment-close-btn {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
}





.loading-view-call-comments-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 24px;
}

</style>