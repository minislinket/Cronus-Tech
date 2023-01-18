<template>
    <div class="quick-menu-wrap" :class="{ hide : hideMenu }">
        <div class="quick-menu-items" v-for="item in showItems" @click="navigate(item)" :key="item.id" :class="{ active  :item.active }">
            <div class="qmenu-icon-wrap">
                <font-awesome-icon v-if="(typeof item.icon === 'object')" @click="navigate(item)" class="qmenu-icon" :icon="item.icon" :style="{ fontSize: item.iconFontSize }" size="lg" />
                <span v-else class="material-symbols-outlined icon-font-size" :style="{ fontSize: item.iconFontSize }">{{ item.icon }}</span>
                <p v-if="item.text" v-html="item.text"></p>
            </div>
        </div>
    </div>
</template>




<script>
import { mapGetters } from 'vuex'


export default {


    data() {
        return {
            hideMenu: false,
            showItems: []
        }
    },




    computed: {
        ...mapGetters({
            menuItems: ['QuickMenu/menuItems'],
            opsMenuItems: ['QuickMenu/opsMenuItems'],
            userType: ['UserRole/currentUserRole']
        })
    },






    watch: {
        userType: {
            handler: function() {
            
                if(this.userType === 1)
                    this.showItems = this.menuItems;
                else if(this.userType === 2 || this.userType === 3)
                    this.showItems = this.opsMenuItems;
                    
            },
            deep:true,
            immediate: true
        }
    },






    mounted() {
        if(this.userType === 1)
            this.showItems = this.menuItems;
        else if(this.userType === 2 || this.userType === 3)
            this.showItems = this.opsMenuItems;


        this.$store.dispatch('QuickMenu/activateMenuItem');
    },







    methods: {

        navigate: function(item) {
            if(item.url === this.$router.currentRoute._value.path) { return }
            this.$store.dispatch('QuickMenu/activateMenuItem');
            this.$router.push(item.url);
        }

    }

}


</script>




<style>

.quick-menu-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 60px;

    background: var(--GunMetal);

    display: flex;
    align-items: center;
    justify-content: space-evenly;
    
    z-index: 800;
    transition: bottom 250ms ease;
}



.quick-menu-wrap.hide {
    transition: bottom 250ms ease;
    bottom: -80px;
}






.quick-menu-items {
    height: 100%;
    width: 100%;
    border-right: 1px solid white;
    display: flex;
    justify-content: center;
    transition: color 250ms ease;
}



.quick-menu-items:last-child {
    border-right: none;
}





.quick-menu-items.active {
    color: var(--BlueLight);
    transition: color 250ms ease;
}






.qmenu-icon-wrap {
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    font-size: 10px;
}




.qmenu-icon {
    font-size: 28px;
    margin-bottom: 3px;
}





.icon-font-size {
    font-size: 30px;
}


</style>