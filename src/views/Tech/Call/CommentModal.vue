<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="on-hold-reason-modal app-modal-content" :class="{ tall : type === 'stock' }">

            <h4>Add Comment to Call #{{ call.id }}</h4>

            <div class="on-hold-initial-selection">
                <select v-model="type">
                    <option value="stock">Stock</option>
                    <option value="store">Store Problem</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div class="on-hold-reason-input-wrap" v-if="type">
                <textarea v-if="type == 'store' || type == 'other'" type="text" placeholder="Reason for placing this job on hold" v-model="reason"></textarea>
                <div v-else class="select-stock-wrap">
                    <h5>Stock Type</h5>
                    <select v-model="selectedCategory">
                        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                    <SearchSelect class="on-hold-stock-reason-search-select" :searchArray="itemsArray" :heading="itemSearch.heading" :displayText="itemDisplayText" @select="selectItem($event)" />
                </div>
            </div>

            <div class="on-hold-stock-grid headings" v-if="type === 'stock'">
                <h5>Item</h5>
                <h5>Qty</h5>
                <h5>Remove</h5>
            </div>


            <div class="on-hold-stock-scroll-section" v-if="type === 'stock'">
                <div class="on-hold-stock-grid" v-for="(item, index) in stockList" :key="item.code">

                    <p class="bold">{{ item.code }}</p>

                    <div>
                        <font-awesome-icon @click="item.quantity >= 2 ? item.quantity-- : null" class="minus-stock-list-item" :icon="['fa', 'minus-square']" size="lg" />
                        <input type="number" v-model="item.quantity" min="1">
                        <font-awesome-icon @click="item.quantity++" class="plus-stock-list-item" :icon="['fa', 'plus-square']" size="lg" />
                    </div>

                    <font-awesome-icon @click="stockList.splice(index, 1)" class="warning" :icon="['fa', 'trash']" size="lg" />

                </div>
            </div>
            
            <div class="on-hold-reason-btn-wrap">
                <button :disabled="type === 'stock' && stockList.length <= 0 || type !== 'stock' && !reason" @click="submitReason()">Submit</button>
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
            type: '',
            reason: '',


            categories: JSON.parse(localStorage.getItem('item_categories')),
            selectedCategory: '',
            

            itemSearch: {
                heading: 'Select Item',
            },
            itemDisplayText: '',
            itemsArray: [],

            allItems: JSON.parse(localStorage.getItem('inventory_items')),

            stockList: [],

            tech_statuses: JSON.parse(localStorage.getItem('call_tech_states'))
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/commentModal'],
            required: ['Call/commentRequired'],
            call: ['Call/commentingOnCall'],
            nextStatusId: ['Call/commentNextStatusId']
        })
    },




    watch: {
        
        selectedCategory: {
            handler: function() {
                if(this.selectedCategory)
                {
                    this.itemsArray = this.allItems.filter(item => item.categoryId == this.selectedCategory);
                }
                else
                {
                    this.itemsArray = [];
                }
            },
            deep: true,
            immediate: true
        },



        type: {
            handler: function() {
                if(this.type === 'stock')
                {
                    this.reason = '';
                }
                else
                {
                    this.selectedCategory = '';
                    this.stockList = [];
                }
            },
            deep: true,
            immediate: true
        }

    },




    mounted() {
        this.reason = '';
    },




    methods: {


        selectItem: function(item) {
            if(!item || item.bubbles) { return }

            this.itemDisplayText = item.description;
            console.log(this.itemDisplayText);


            var flag = false;
            this.stockList.map(sItem => sItem.code === item.code ? flag = true : null);

            if(flag)
            {
                var toast = {
                    shown: false,
                    type: 'info', // ['info', 'warning', 'error', 'okay']
                    heading: 'Item already on the list', // (Optional)
                    body: 'Please adjust it\'s quantity', 
                    time: 3000, // in milliseconds
                    icon: '' // leave blank for default type icon
                }

                this.$store.dispatch('Toast/toast', toast, {root: true});

                setTimeout(() => {
                    this.itemDisplayText = '';
                    console.log(this.itemDisplayText);
                }, 30);
            }
            else
            {
                item['quantity'] = 1;
                this.stockList.push(item);
                
                console.log('Stock list updated: ', this.stockList);
                setTimeout(() => {
                    this.itemDisplayText = '';
                    console.log(this.itemDisplayText);
                }, 30);
                
            }
        },



        closeCommentModal: function() {
            this.$store.dispatch('Call/commentModal', false);
            this.type = '';
            this.selectedCategory = '';
            this.reason = '';
            this.stockList = [];
        },



        submitReason: function() {
            var reason = JSON.parse(JSON.stringify(this.reason));
            var stockList = JSON.parse(JSON.stringify(this.stockList));
            this.$emit('submitReason', { reason, stockList });

            this.closeCommentModal();
            /* setTimeout(() => {
                this.reason = '';
                this.stockList = [];
            }, 500); */
        }

    }

}
</script>


<style>


.on-hold-reason-modal {
    
    max-height: 80vh;
    width: 90vw;
    padding-bottom: 50px;
}

.on-hold-reason-modal.tall {
    height: 80vh;
}

.on-hold-reason-modal.active {
    top: 120px;
}




.on-hold-stock-reason-search-select .search-input-wrap input,
.on-hold-stock-reason-search-select .search-results-drop-down-wrap {
    width: 70vw;
}

.on-hold-stock-reason-search-select.array-input-search-wrap h4 {
    text-align: center;
    font-size: 14px;
}


.on-hold-reason-modal h4 {
    
}



.on-hold-initial-selection {
    margin-bottom: 15px;
}

.on-hold-initial-selection select {
    width: 60%;
}




.on-hold-reason-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}


.on-hold-reason-input-wrap textarea {
    width: 80%;
    height: 200px;
}






.select-stock-wrap select {
    margin-bottom: 10px;
}



.on-hold-stock-grid.headings {

}




.on-hold-stock-scroll-section {
    height: 50%;
    overflow-y: scroll;
    box-shadow: inset 0px -8px 6px -6px rgba(0,0,0,0.4);
}




.on-hold-stock-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    column-gap: 8px;
    align-items: center;
    justify-items: center;
}

.on-hold-stock-grid input {
    width: 40px;
    height: 25px;
    background: transparent;
    text-align: center;
    padding: 0;
    font-weight: 700;
    color: var(--OffWhite);
    font-size: 16px;
}


.minus-stock-list-item {
    margin-right: 3px;
}

.plus-stock-list-item {
    margin-left: 3px;
}




.on-hold-reason-btn-wrap {
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

</style>