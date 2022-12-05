<template>
    <div :id="randomID+'ArrayInputSearch'" class="array-input-search-wrap">
        <h4 v-if="heading">{{ heading }}</h4>
        <div class="search-input-wrap">
            <input type="text" v-model="searchInput" placeholder="start typing to search..." @keydown.native.esc="showDropDown = false" @keydown.native.down="selectKeyboardNavList($event)" @input="filterGroup()" @click="showDropDown ? showDropDown = false : null"  />
            <font-awesome-icon style="margin-right: 35px;" class="drop-down-icon" :class="{ rotate : showDropDown }" :icon="['fa', 'sort-down']" size="lg" />
        </div>

        <div class="search-results-drop-down-wrap" v-if="showDropDown">
            <div class="search-results-grid" v-for="(result, index) in filteredResults.splice(0,20)" :key="result.id" :id="randomID + index" :tabindex="index" @click="selectItem(result)" @keydown.enter.prevent="selectItem(result)" @keydown.native.esc="showDropDown = false" @keydown.native.down="keyboardNavListDown($event, index)" @keydown.native.up="keyboardNavListUp($event, index)">
                <p v-if="result.code">{{ result.code }}</p>
                <p v-if="result.code"> - </p>
                <p :class="{ 'fill-all-columns' : !result.code }">{{ result.name }}</p>
            </div>
        </div>
        
    </div>
</template>



<script>

export default {

    
    props: ['searchArray', 'heading', 'displayText'],
    
    
    data(){
        return {
            searchInput: '',
            showDropDown: false,
            filteredResults: [],
            randomID: Math.random().toString(36).substr(2, 5)
        }
    },



    watch: {
        showDropDown: function() {
            if(this.showDropDown)
                window.addEventListener('click', this.checkClickedOnThisModule)
            else
                window.removeEventListener('click', this.checkClickedOnThisModule)
        },


        searchArray: {
            handler: function() {
                if(this.searchArray.length >= 1)
                    this.filteredResults = this.searchArray
                else
                    this.filteredResults = [];
            },
            deep: true,
            immediate: true
        },


        displayText: {
            handler: function() {
                if(this.displayText)
                {
                    this.searchInput = this.displayText;
                }
            },
            deep: true,
            immediate: true
        }
    },





    mounted() {
        this.filteredResults = this.searchArray;
    },

    methods: {


        checkClickedOnThisModule: function(e) {
            setTimeout(() => {            
                var module = document.getElementById(this.randomID+'ArrayInputSearch');
                if(module && !module.contains(e.target))
                {
                    this.showDropDown = false;
                }
            }, 50);
        },




        selectItem: function(item) {
            this.showDropDown = false;
            this.$emit('select', item);
            this.searchInput = item.name;
        },









        filterGroup: function() {

            this.showDropDown = true;

            if(this.searchInput.includes('(') || this.searchInput.includes(')')) { return }

            if(this.searchInput === '')
            {
                this.$emit('select', null);
                this.filteredResults = this.searchArray;
            }


            this.filteredResults = this.searchArray.filter(item => {

                if(item.name.toLowerCase().indexOf(this.searchInput.toLowerCase()) !== -1)
                {
                    return item;
                } 
                if(item.code)
                {
                    if(item.code.toString().toLowerCase().indexOf(this.searchInput.toLowerCase()) !== -1)
                    {
                        return item;
                    }
                }
            });
            
        },






        selectKeyboardNavList: function(e) {

            e.preventDefault();

            this.showDropDown = true;

            setTimeout(() => {
                document.getElementById(this.randomID + '0').focus();
            }, 100);

        },

        keyboardNavListDown: function(e, index) {

            var newIndex = index + 1;
            //console.log('Nav down: ',e, newIndex);
            
            e.preventDefault();


            if(index <= this.filteredResults.length - 2)
            {
                document.getElementById(this.randomID + newIndex).focus();
            }
            else
            {
                document.getElementById(this.randomID + '0').focus();
            }
            
        },

        keyboardNavListUp: function(e, index) {

            var newIndex = index - 1;
            //console.log('Nav up: ',e);
            e.preventDefault(); 
            if(index >= 1)
            {
                document.getElementById(this.randomID + newIndex).focus();
            }
            else
            {
                var lastIndex = 0;
                lastIndex = this.filteredResults.length - 1;
                document.getElementById(this.randomID + lastIndex).focus();
            }
        },

    }

}

</script>



<style>

.array-input-search-wrap.dark-mode {
    background: none;
}


.array-input-search-wrap {
    position: relative;
    
}


.array-input-search-wrap h4 {
    text-align: left;
}



.search-input-wrap input{
    width: 350px;
    margin-right: 10px;
    padding-left: 10px;
}


.search-input-wrap input.sml-txt::placeholder {
    font-size: 10px;
}



.po-search-bar-row-wrap.search-criteria-row-wrap .search-input-wrap input {
    width: 65vw;
    margin-right: 10px;
}









.search-results-drop-down-wrap {
    position: absolute;
    width: calc(100% - 10px);
    max-height: 400px;
    overflow-y: scroll;
    z-index: 1200;
}


.search-results-drop-down-wrap::-webkit-scrollbar {
    width: 10px;
}
.search-results-drop-down-wrap::-webkit-scrollbar-track {
    background: rgba(97, 97, 97, 0.95);
}
.search-results-drop-down-wrap::-webkit-scrollbar-thumb {
    background: rgba(46, 168, 255, 0.562);
}
.search-results-drop-down-wrap::-webkit-scrollbar-thumb:hover {
    background: #555;
}





.array-input-search-wrap.dark-mode .search-results-grid {
    background: var(--DarkGrey);
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.search-results-grid {
    
    display: grid;
    grid-template-columns: 0.9fr 0.28fr 2.5fr;
    background: var(--DarkGrey);
    border-bottom: 1px solid rgba(255,255,255,0.15);
    cursor: pointer;
    padding: 8px 0;
}





.array-input-search-wrap.dark-mode .search-results-grid:focus {
    background: var(--LightBlue);
}

.search-results-grid:focus {
    outline: none;
    background: var(--XLightBlue);
}



.search-results-grid .fill-all-columns {
    grid-column: 1 / span 3;
}
</style>