<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="comment-modal app-modal-content" :class="{ tall : type === 'stock' }">


            <div class="comment-headers-wrap">
                <h4>{{ call.customerStoreName.substr(0, 25) }}</h4>
                <h4 class="status-heading on-hold">
                    <font-awesome-icon class="comments-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                    {{ getTechStatusName(6) }}
                </h4>
                
            </div>

            <h5 class="for-calls-heading">Commenting on Call:</h5>            
            <h5 class="calls-heading-wrap">
                <span class="calls-heading">{{ call.id }}</span>
            </h5>

            <h4>Comment Type</h4>

            <div class="comment-initial-selection">
                <select v-model="type">
                    <option value="stock">Stock</option>
                    <option value="store">Store Problem</option>
                    <option value="order">Awaiting Order</option>
                </select>
            </div>

            <div class="comment-input-wrap" v-if="type">
                <textarea v-if="type == 'store'" type="text" placeholder="Add Comment" v-model="reason"></textarea>
                <div v-else-if="type == 'stock'" class="select-stock-wrap">
                    <h5>Stock Type</h5>
                    <select v-model="selectedCategory">
                        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                    <SearchSelect class="comment-stock-reason-search-select" :searchArray="itemsArray" :heading="itemSearch.heading" :displayText="itemDisplayText" @select="selectItem($event)" />
                </div>
                <p v-if="type == 'order'">{{ reason }}</p>
            </div>

            <div class="comment-stock-grid headings" v-if="type === 'stock'">
                <h5>Item</h5>
                <h5>Qty</h5>
                <h5>Remove</h5>
            </div>


            <div class="comment-stock-scroll-section" v-if="type === 'stock'">
                <div class="comment-stock-grid" v-for="(item, index) in stockList" :key="item.code">

                    <p class="bold">{{ item.code }}</p>

                    <div>
                        <font-awesome-icon @click="item.quantity >= 2 ? item.quantity-- : null" class="minus-stock-list-item" :icon="['fa', 'minus-square']" size="lg" />
                        <input type="number" v-model="item.quantity" min="1">
                        <font-awesome-icon @click="item.quantity++" class="plus-stock-list-item" :icon="['fa', 'plus-square']" size="lg" />
                    </div>

                    <font-awesome-icon @click="stockList.splice(index, 1)" class="warning" :icon="['fa', 'trash']" size="lg" />

                </div>
            </div>
            
            <div class="comment-btn-wrap">
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
            call: ['Call/call'],
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
                if(this.type === 'order')
                {
                    this.reason = 'Awaiting Order!';
                    this.selectedCategory = '';
                    this.stockList = [];
                }
                if(this.type === 'store')
                {
                    this.reason = '';
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




        getTechStatusName: function(techStateId) {
            return this.tech_statuses.filter(status => status.id === techStateId)[0].name;
        },





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
            var type = JSON.parse(JSON.stringify(this.type));
            this.$emit('submitComment', { reason, stockList, type });

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


.app-modal-content.comment-modal {
    
    height: 80vh;
    max-height: 80vh;
    width: 90vw;
    padding-bottom: 50px;
    padding-top: 0;
}

.app-modal-content.comment-modal.tall {
    height: 80vh;
}

.comment-modal.active {
    top: 120px;
}




.comment-stock-reason-search-select .search-input-wrap input,
.comment-stock-reason-search-select .search-results-drop-down-wrap {
    width: 70vw;
}

.comment-stock-reason-search-select.array-input-search-wrap h4 {
    text-align: center;
    font-size: 14px;
}





.comment-headers-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 -8px;
    padding: 5px 8px;
    margin-bottom: 5px;
    border-bottom: 1px solid var(--OffWhite);
}



.for-calls-heading {
    text-align: left;
}


.calls-heading-wrap {
    margin-bottom: 10px;
    text-align: left;
}






.comment-initial-selection {
    margin-bottom: 15px;
}

.comment-initial-selection select {
    width: 60%;
}




.comment-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}


.comment-input-wrap textarea {
    width: 80%;
    height: 200px;
}






.select-stock-wrap select {
    margin-bottom: 10px;
}



.comment-stock-grid.headings {

}




.comment-stock-scroll-section {
    height: 36%;
    overflow-y: scroll;
    box-shadow: inset 0px -8px 6px -6px rgba(0,0,0,0.4);
}




.comment-stock-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    column-gap: 8px;
    align-items: center;
    justify-items: center;
}

.comment-stock-grid input {
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




.comment-btn-wrap {
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



.comment-btn-wrap button.warning.orange {
    color: var(--WarningOrange);
}



.status-heading {
    display: flex;
    align-items: center;
    font-size: 14px;
}


/* .status-heading.pending {
    color: var(--Pending);
}

.status-heading.received {
    color: var(--Received);
}

.status-heading.en-route {
    color: var(--EnRoute);
}

.status-heading.rerouted {
    color: var(--Rerouted);
}

.status-heading.on-site {
    color: var(--OnSite);
}

.status-heading.left-site {
    color: var(--LeftSite);
}

.status-heading.on-hold {
    color: var(--OnHold);
}

.status-heading.completed {
    color: var(--Completed);
} */






.comments-tech-state-icon {
    margin-right: 3px;
    font-size: 16px;
}




.comments-tech-state-icon.left-site {
    color: var(--LeftSiteLight);
}
.comments-tech-state-icon.on-hold {
    color: var(--OnHoldLight);
}
.comments-tech-state-icon.rerouted {
    color: var(--ReroutedLight);
}



</style>