<template>
    <div class="edit-call-types-modal-wrap" v-if="active">

        <h3>Edit Call Types</h3>
        

        <div class="edit-call-type-wrap">
            <h4>Call Type</h4>
            <select v-model="callTypeId">
                <option v-for="type in callTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
        </div>

        <div class="edit-call-sub-type-wrap">
            <h4>Call Sub Type</h4>
            <select class="edit-call-types-tech-selection" v-model="callSubTypeId">
                <option v-for="subtype in callSubTypes" :key="subtype.id" :value="subtype.id">{{ subtype.name }}</option>
            </select>
        </div>

        

        

        <button class="save-changes-edit-call-types-btn" @click="canSaveCallTypes()">Save Changes</button>


        <button class="close-info-modal-btn" @click="$store.dispatch('AllocateTech/editCallTypesModal', false)">Close</button>

    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            callTypes: JSON.parse(localStorage.getItem('call_types')),
            callSubTypes: JSON.parse(localStorage.getItem('call_sub_types')),
            callTypeId: '',
            callSubTypeId: ''
        }
    },



    computed: {
        ...mapGetters({
            active: ['AllocateTech/editCallTypesModal'],
            call: ['AllocateTech/call']
        })
    },



    watch: {


        active: {
            handler: function() {
                
            },
            deep: true
        },



        call: {
            handler: function() {
                if(this.call)
                {
                    this.callTypeId = this.call.callTypeId;
                    this.callSubTypeId = this.call.callSubTypeId;
                }
            },
            deep: true
        }
    },



    mounted() {
        if(this.call)
        {
            this.callTypeId = this.call.callTypeId;
            this.callSubTypeId = this.call.callSubTypeId;
        }
    },



    methods: {

        canSaveCallTypes: function() {
            var flag = false;


            if(!this.callTypeId)
            {
                flag = true;
                var toast = {
                    shown: false,
                    type: "error",
                    heading: "Must have a Call Type",
                    body: '',
                    time: 2000,
                    icon: "" // leave blank for default type icon
                };
                this.$store.dispatch("Toast/toast", toast);
            }
            if(!this.callSubTypeId)
            {
                flag = true;
                var toast = {
                    shown: false,
                    type: "error",
                    heading: "Must have a Call Sub Type",
                    body: '',
                    time: 2000,
                    icon: "" // leave blank for default type icon
                };
                this.$store.dispatch("Toast/toast", toast);
            }

            console.log('Did we flag something? ', flag);

            if(!flag)
            {
                this.saveCallTypes();
            }
        },



        saveCallTypes: function() {
            console.log('Saving call types...');
            var payload = {
                callTypeId: this.callTypeId,
                callSubTypeId: this.callSubTypeId
            }
            this.$store.dispatch('AllocateTech/updateCallTypes', payload);
        }

    }

}
</script>



<style>


.edit-call-types-modal-wrap {
    position: fixed;
    height: max-content;
    max-height: 75vh;
    width: 80vw;
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
    overflow-y: scroll;
    z-index: 500;
}




.edit-call-types-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
}



.edit-call-types-modal-wrap select {
    margin-bottom: 15px;
}






.edit-call-sub-type-wrap select {
    margin-bottom: 25px;
}





.save-changes-edit-call-types-btn {
    margin-bottom : 35px;
}



</style>