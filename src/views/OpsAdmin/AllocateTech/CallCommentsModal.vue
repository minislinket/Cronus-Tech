<template>
    <div class="call-comments-modal-wrap" v-if="active">

        <h3>Call Comments</h3>

        <div class="call-comments-grid-scroll-section">
            <template v-for="comment in callComments" :key="comment.id">
                <div class="call-comment-card">
                    <div class="call-comment-card-header">
                        <p>{{ comment.time }}</p>
                        <p :class="{ 'resolved' : comment.resolved, 'unresolved' : !comment.resolved }">Resolved: {{ comment.resolved ? 'Yes' : 'No' }}</p>
                    </div>
                    <p v-html="comment.comment"></p>
                </div>
            </template>
        </div>

        <button class="close-btn" @click="$store.dispatch('AllocateTech/callCommentsModalActive', false)">Close</button>
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
            active: ['AllocateTech/callCommentsModalActive'],
            callComments: ['AllocateTech/callComments']
        })
    },




    watch: {

    },




    methods: {

    }

}
</script>



<style>

.call-comments-modal-wrap {
    position: fixed;
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
    z-index: 500;
}


.call-comments-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
    display: flex;
    flex-direction: column;
}










.call-comments-grid-scroll-section {
    height: 85%;
    overflow-y: scroll;
    margin-bottom: 20px;
}



.call-comment-card {
    background: var(--EnRouteDark);
    margin-bottom: 25px;
    border-radius: 3px;
}

.call-comment-card-header {
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

.call-comment-card-header p.resolved {
    color: var(--OkayGreen);
}

.call-comment-card-header p.unresolved {
    color: var(--WarningRed);
}

.call-comment-card p {
    padding: 0 10px;
    padding-bottom: 8px;
}

.call-comment-card-header p {
    padding-bottom: 0;
}





.call-comments-modal-wrap .close-btn {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
}

</style>