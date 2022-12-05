<template>
    <div class="page-bot-found-wrap">
        <h2>The page/url you entered does not exist on this application</h2>
        <p>Please check the url carefully or go back to the <router-link to="/dashboard">Dashboard</router-link></p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters({
            userType: ['UserRole/currentUserRole']
        })
    }
}
</script>

<style>

</style>