<template>
    <div class="technician-stock-levels-wrap">

        <div class="loading-lightbox-wrap on-top" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>

        <button class="load-tech-stock-btn" @click="loadTechStock()"><font-awesome-icon :icon="['fa','']" size="lg" /> Load Stock</button>

        <div class="tech-stock-search-filter-wrap">
            <div>
                <h4>Category</h4>
                <select v-model="selectedCategory" @change="filterItems()" :disabled="stockItems.length <= 0">
                    <option value="">--</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
            </div>

            <div>
                <h4>Search</h4>
                <input type="text" v-model="searchString" @input="filterBySearchString()" :disabled="stockItems.length <= 0">
            </div>
        </div>

        <div class="tech-stock-grid headings">
            <h4>Code</h4>
            <h4>Description</h4>
            <h4 class="center-align">Current Qty</h4>
        </div>


        <div class="tech-stock-scroll-section">
            <div class="tech-stock-grid data" v-for="item in filteredItems" :key="item.id">
                <p>{{ item.inventoryItemId }}</p>
                <p class="tech-stock-item-description">{{ item.name }}</p>
                <p class="center-align">{{ item.currentQuantity }}</p>
            </div>
        </div>

    </div>
</template>



<script>
import { mapGetters } from 'vuex'


export default {

    data() {
        return {
            categories: JSON.parse(localStorage.getItem('item_categories')),
            selectedCategory: '',


            filteredItems: [],
            searchString: ''
        }
    },



    computed: {
        ...mapGetters({
            loading: ['TechStock/loading'],
            stockItems: ['TechStock/stock']
        })
    },




    watch: {

        stockItems: {
            handler: function() {
                this.filteredItems = this.stockItems;
            },
            deep: true
        }

    },




    mounted() {
        
    },





    methods: {

        loadTechStock: function() {

            this.$store.dispatch('TechStock/loadTechnicianStock')
            
        },




        filterItems: function() {
            if(this.selectedCategory)
            {
                this.filteredItems = this.stockItems.filter(item => item.categoryId === this.selectedCategory);
            }
            else
            {
                this.filteredItems = this.stockItems;
            }
        },





        filterBySearchString: function() {
            if(this.searchString)
            {
                this.filteredItems = this.stockItems.filter(item => {
                    if(item.name.indexOf(this.searchString) !== -1)
                    {
                        if(this.selectedCategory)
                        {
                            if(item.categoryId == this.selectedCategory)
                            {
                                return item
                            }
                        }
                        else
                        {
                            return item
                        }
                        
                    }
                    if(item.inventoryItemId.toString().indexOf(this.searchString) !== -1)
                    {
                        if(this.selectedCategory)
                        {
                            if(item.categoryId == this.selectedCategory)
                            {
                                return item
                            }
                        }
                        else
                        {
                            return item
                        }
                    }
                })
            }
            else
            {
                this.filteredItems = this.stockItems;
            }

            // if(this.selectedCategory)
            // {
            //     this.filterItems();
            // }
        },


    }

}


</script>



<style>



.tech-stock-scroll-section {
    overflow-y: scroll;
    height: 65vh;
    position: fixed;
    top: 155px;
    width: 100vw;
    padding: 0 10px;
}


.tech-stock-grid {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    align-items: center;
    text-align: left;
    margin-bottom: 3px;
    padding: 2px 0;
    border-bottom: 1px dashed rgba(240,240,240,0.2);
    font-size: 12px;
}


.tech-stock-grid.headings {
    padding: 2px 10px;
}


.tech-stock-grid.data .center-align {
    justify-self: center;
    text-align: center;
}


.tech-stock-grid:last-child {
    border-bottom: none;
}



.tech-stock-item-description {
    
}



.tech-stock-search-filter-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 10px;
    margin-top: 60px;
    margin-bottom: 10px;
}


.tech-stock-search-filter-wrap h4 {
    text-align: left;
}


.tech-stock-search-filter-wrap select {
    margin-right: 5px;
}

.tech-stock-search-filter-wrap input {
    margin-left: 5px;
}






.load-tech-stock-btn {
    position: absolute;
    bottom: 80px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
    z-index: 999;
}

</style>