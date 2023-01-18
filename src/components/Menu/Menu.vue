<template>
    <div class="menu-wrap" v-if="isAuth">

        <div class="page-heading-wrap">
            <font-awesome-icon v-if="(titleIcon && titleIcon.length === 2 && typeof titleIcon === 'object')" class="page-heading-icon" :icon="$route.meta.icon" size="lg" />
            <span v-else-if="(typeof titleIcon === 'string')" class="material-symbols-outlined page-heading-icon material">{{ $route.meta.icon }}</span>
            <h2>{{ titleText }}</h2>
        </div>

        <div class="offline-wrap" v-if="!online">
            <font-awesome-icon class="offline-icon" :icon="['fa', 'exclamation-triangle']" size="lg" />
            <span>offline</span>
        </div>

        <font-awesome-icon @click="userMenuActive = !userMenuActive" class="user-menu-icon" :class="{ active : userMenuActive }" :icon="['fa', 'user-circle']" size="lg" />
        <div id="UserMenu" class="user-menu-wrap" :class="{ active : userMenuActive }">
            <font-awesome-icon @click="$router.push('/settings'), userMenuActive = false" class="settings-icon" :icon="['fa', 'cog']" size="lg" />
            <font-awesome-icon @click="$store.dispatch('Login/logout')" class="logout-icon" :icon="['fa', 'power-off']" size="lg" />
        </div>

    </div>
</template>




<script>
import { mapGetters } from 'vuex'

export default {


    data() {
        return {
            userMenuActive: false,
            routeTitle: '',
        }
    },





    computed: {
        ...mapGetters({
            online: ['StaticResources/online'],
            menuItems: ['QuickMenu/menuItems'],
            titleIcon: ['Menu/titleIcon'],
            titleText: ['Menu/titleText'],
            isAuth: ['Login/isAuth']
        })
    },



    watch: {
        userMenuActive: function() {
            if(this.userMenuActive === true)
                setTimeout(() => {
                    document.addEventListener('click', this.hideMenu)
                }, 150)
            else
                document.removeEventListener('click', this.hideMenu)
        },

        '$route.meta.title': {
            handler: function() {
                // console.log('Route meta changed')
                this.routeTitle = this.$route.meta.title
            },
            deep: true,
            immediate: true
        }
    },

 



    mounted() {
        
    },





    methods: {

        hideMenu: function(e) {
            var userMenu = document.getElementById('UserMenu');
            if(userMenu && !userMenu.contains(e.target))
                this.userMenuActive = false;
        },



        

    },



    

}
</script>




<style>


.menu-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 50px;

    display: flex;
    align-items: center;

    z-index: 800;

    background: var(--BlueAlt);
    box-shadow: 0 2px 6px 0 rgba(0,0,0,0.15);
}











.page-heading-wrap {
    display: flex;
    align-items: center;
    padding-left: 12px;
}


.page-heading-wrap h2 {
    font-size: 1.2em;
}



.page-heading-icon {
    margin-right: 10px;
    font-size: 24px;
}

.page-heading-icon.material {
    font-size: 32px;
}











.offline-wrap {
    position: absolute;
    right: 20%;
    color: rgb(230,0,0);
    font-weight: 700;
    display: flex;
    align-items: center;
}


.offline-wrap .offline-icon {
    font-size: 16px;
    margin-right: 5px;
}


.offline-wrap span {

}













.user-menu-icon {
    position: absolute;
    right: 15px;
    top: 0;
    bottom: 0;
    margin: auto 0;
    color: var(--BlueLight);
    cursor: pointer;
    font-size: 28px;
    z-index: 801;
    transition: color 250ms ease-in;
}



.user-menu-icon.active {
    color: var(--BlueDark);
    transition: color 250ms ease-out;
}







@keyframes slide-user-menu-in {
    0% {
        opacity: 0;
        right: -500px;
    }
    100%{
        opacity: 1;
        right: 0px;
    }
}


@keyframes slide-user-menu-out {
    0% {
        opacity: 1;
        right: 0px;
    }
    25%{
        right: 0px;
    }
    60% {
        opacity: 0.1;
    }
    100%{
        opacity: 0;
        right: -500px;
    }
}




.user-menu-wrap {
    position: absolute;
    top: 0px;
    right: -500px;
    height: 50px;
    min-width: 100px;
    background: var(--BlueMid);
    z-index: 800;
    padding-right: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom-left-radius: 3px;
    animation: slide-user-menu-out 500ms ease;
}


.user-menu-wrap.active {
    right: 0;
    animation: slide-user-menu-in 250ms ease;
}


.settings-icon {
    color: var(--Spunk);
    font-size: 20px;
    padding-right: 7px;
    padding-left: 15px;
}


.logout-icon {
    color: rgb(200,0,0);
    font-size: 20px;
    padding: 0 10px;
}

</style>