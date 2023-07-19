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

        <div class="menu-icon-wrap">
            <span v-if="updateAvailable" class="menu-icon-badge"></span>
            <font-awesome-icon @click="userMenuActive = !userMenuActive" class="user-menu-icon" :class="{ active : userMenuActive }" :icon="['fa', 'user-circle']" size="lg" />
        </div>
        <div id="UserMenu" class="user-menu-wrap" :class="{ active : userMenuActive }">
            <div class="settings-icon-wrapper user-menu-icon-wrapper">
                <span v-if="updateAvailable" class="user-menu-icon-badge"></span>
                <font-awesome-icon @click="$router.push('/settings'), userMenuActive = false" class="settings-icon" :icon="['fa', 'cog']" size="lg" />
            </div>
            <div class="logout-icon-wrapper user-menu-icon-wrapper">
                <font-awesome-icon @click="confirmLogout()" class="logout-icon" :icon="['fa', 'power-off']" size="lg" />
            </div>
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
            isAuth: ['Login/isAuth'],
            updateAvailable: ['Settings/updateAvailable'],
            modal: ['Modal/modal']
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
        },

        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('confirm_logout') !== -1)
                    this.$store.dispatch('Login/logout')
            },
            deep: true
        }
    },

 



    mounted() {
        
    },





    methods: {



        confirmLogout: function() {
            var modal = {
                active: true, // true to show modal
				type: 'info', // ['info', 'warning', 'error', 'okay']
				icon: [], // Leave blank for no icon
				heading: 'Logout',
				body: 'Are you sure you want to logout of Cronus Tech?.',

				// Optional add on for when user needs to confirm or deny an action
				confirmAction: 'init',
				actionFrom: 'confirm_logout',
				resolveText: 'Logout',
				rejectText: 'Cancel'
            }

            this.$store.dispatch('Modal/modal', modal);
        },



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










.menu-icon-wrap {
    position: absolute;
    right: 12.5px;
    top: 0;
    bottom: 0;
    margin: auto 0;
    z-index: 801;
    display: flex;
    align-items: center;
}


.user-menu-icon {
    color: var(--BlueLight);
    cursor: pointer;
    font-size: 28px;
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
    width: 152px;
    background: var(--BlueMid);
    z-index: 800;
    padding-right: 50px;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: 50px 50px;
    border-bottom-left-radius: 3px;
    animation: slide-user-menu-out 500ms ease;
}


.user-menu-wrap.active {
    right: 0;
    animation: slide-user-menu-in 250ms ease;
}







.menu-icon-badge {
    position: absolute;
    top: 8px;
    right: -5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(255, 122, 14);
    z-index: 802;
}




.user-menu-icon-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background: var(--GunMetal); */
    width: 50px;
    position: relative;
    border-right: 3px solid rgba(0,0,0,0.15);
}


.user-menu-icon-badge {
    position: absolute;
    top: 8px;
    right: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(255, 122, 14);
    z-index: 802;
}


.user-menu-icon-wrapper.settings-icon-wrapper {
    /* background: var(--Spunk); */
    
}


.settings-icon {
    color: var(--DarkBlue);
    font-size: 24px;    
}


.logout-icon {
    color: rgb(200,0,0);
    font-size: 22px;
    padding: 0 10px;
}

</style>