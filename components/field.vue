<template>
    <div class="field_container">
        <div class="field_text" v-if="type == -1">Ваше поле</div>
        <div class="field_text" v-else>Поле противника</div>
        <div class="field">
            <div class="row" v-for="(i, x) in field" :key="x">
                <div v-on:click="cellClick(x,y)" class="cell" v-for="(item, y) in i" :key="y" :class="[(item == 1) ? 'ship_style' : '', (item == 0) ? 'empty_style' : '', (item == 2) ? 'shot_style' : '', (item == 3) ? 'killed_style' : '', (item == 4) ? 'blown_style' : '']"></div>
            </div>
        </div>
    </div>
</template>

<style>
    .ship_style{
        background-color: blue;
    }
    .empty_style{
        background-color: white;
    }
    .shot_style{
        background-color: grey;
    }
    .killed_style{
        background-color: red;
    }
    .blown_style{
        background-color: darkred;
    }
    .cell{
        width: 5rem;
        height: 5rem;
        border: 0.1rem black solid;
        margin: 0;
        padding: 0;
    }
    .row{
        display: flex;
        flex-direction: row;
    }
    .field{
        display: flex;
        flex-direction: column;
    }
    .field_container{
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }
</style>

<script>
    export default {
        props:['field', 'type', 'turn'],
        methods: {
            cellClick: function(x,y){
                if(this.type < 0 || this.turn != this.type) return;
                socket.emit("click", {x: x, y: y});
            },
        },
    }
</script>