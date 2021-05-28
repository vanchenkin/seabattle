<template>
    <div id="app">
        <div class="status" v-if="turn != type && turn >= 0">Ход противника</div>
        <div class="status" v-if="turn == type && turn >= 0">Ваш ход</div>
        <div class="status" v-if="turn == -1">Ожидание игрока</div>
        <div class="status" v-if="status">{{ status }}</div>
    	<div class="fields" v-if="connected">
            <field :field="field1" :type="-1"></field>
            <field :field="field2" :type="type" :turn = "turn"></field>
        </div>
        <template v-else>
            <div class="connect">
                <button class="button_create" v-on:click="create_game">Создать игру</button>
                <div class="form">
                    <span>Присоединиться к игре:</span> <input v-model="code" type="text" class="input_code" placeholder="код приглашения"> <button class="button_join" v-on:click="join_game">Ок</button>
                </div>
            </div>
        </template>
    </div>
</template>

<style>
    #app{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-self: center;
    }
    .connect{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .connect > *{
        margin: 0.5rem 0;
    }
    .button_create{
        font-size: 2rem;
    }
    .input_code{
        height: 2rem;
    }
    .form{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
    }
    .form > *{
        margin: 0 0.5rem;
    }
    .fields{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
    .fields > *{
        margin: 1rem;
    }
</style>

<script>
    export default {
        data() {
            return {
                connected: false,
                status: null,
                turn: -2,
                field1: [],
                field2: [],
                code: '',
                type: null,
            }
        },
        mounted() {
            socket.on("canceled", ()=>{
                this.status = "Игрок покинул матч";
                this.turn = -2;
                this.connected = false;
            });
            socket.on("create_response", (data)=>{
                this.field1 = data.field;
                this.field2 = config.makeEmptyArray();
                this.connected = true;
                this.turn = -1;
                this.status = "Код приглашения: "+data.id;
            });
            socket.on("join_response", (data)=>{
                if(data.error){
                    this.status = "Игра не найдена!";
                    return;
                }
                this.field1 = data.field;
                this.field2 = config.makeEmptyArray();
                this.connected = true;
            });
            socket.on("start", (data)=>{
                this.status = "";
                this.turn = data.turn;
                this.type = data.type;
            });
            socket.on("bad_shot", ()=>{
                alert("Вы уже стреляли сюда");
            });
            socket.on("turn", (data)=>{
                if(this.turn == this.type){
                    if(data.type == "empty"){
                        this.changeCellFeild2(data.x, data.y, config.state.SHOT);
                        this.turn = 1 - this.turn;
                    }else if(data.type == "killed"){
                        this.changeCellFeild2(data.x, data.y, config.state.KILLED);
                    }else if(data.type == "blown"){
                        for(let i of data.ship)
                            this.changeCellFeild2(i[0], i[1], config.state.BLOWN);
                    }
                }else{
                    if(data.type == "empty"){
                        this.changeCellFeild1(data.x, data.y, config.state.SHOT);
                        this.turn = 1 - this.turn;
                    }else if(data.type == "killed"){
                        this.changeCellFeild1(data.x, data.y, config.state.KILLED);
                    }else if(data.type == "blown"){
                        for(let i of data.ship)
                            this.changeCellFeild1(i[0], i[1], config.state.BLOWN);
                    }
                }
            });
            socket.on("end", (data)=>{
                if(data.type == this.type)
                    this.status = "Вы выиграли :)";
                else
                    this.status = "Вы проиграли :(";
                this.field2 = data.field;
                this.turn = -3;
            });
        },
        methods: {
            create_game: function(){
                socket.emit("create");
            },
            join_game: function(){
                socket.emit("join", this.code);
            },
            changeCellFeild1(row, col, value) {
                const newRow = this.field1[row].slice(0);
                newRow[col] = value;
                this.$set(this.field1, row, newRow);
            },
            changeCellFeild2(row, col, value) {
                const newRow = this.field2[row].slice(0);
                newRow[col] = value;
                this.$set(this.field2, row, newRow);
            },
        },
    }
</script>