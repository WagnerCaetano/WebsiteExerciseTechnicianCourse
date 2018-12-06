//instanciando as variaveis de uso
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const porta = 54000;
const sql = require('mssql');
const conexaoStr = "Server=localhost;Database=WebSiteHoteis;User Id=Admin;Password=20092001; ";

// abre a conexao
sql.connect(conexaoStr)
.then(conexao => global.conexao = conexao)
.catch(erro => console.log(erro));

// configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
// permite acesso do javascript no servidor local do node

// definindo estrategia
/*
        ESQUEMA DE CONVERSA SERVIDOR -- NODE -- LOCALHOST -- JAVASCRIPT

        NODE ----> Servidor local [localhost:54000] ----> 'posta o json'  
        
        [COM A FUNÇÃO ABAIXO]
        
        ---- >acesso do JSON para o Javascript

*/ 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PATCH, DELETE");
    next();
    });

//definindo as rotas
const rota = express.Router();
// OQUE O USUARIO VAI ENCONTRAR EM 'localhost:54000/'
rota.get('/', (requisicao, resposta) => resposta.json({ mensagem: 'Funcionando!'}));
app.use('/', rota);

/*LISTANDO DADOS*/ 

function execSQL(sql, resposta) {
    global.conexao.request()
    .query(sql)
    .then(resultado => resposta.json(resultado.recordset))
    .catch(erro => resposta.json(erro));
    }
    rota.get('/cheap/S', (requisicao, resposta) =>{
        execSQL('exec sp_preco ', resposta);
        })

    rota.get('/cheap/R',(requisicao,resposta) =>{
        execSQL('select * from Whotel where Hotelname in (select distinct (HotelName) from WHotel,WQuarto where WHotel.HotelId = WQuarto.HotelId and preco in( select top 5 preco from ##MinPreco))',resposta);
    })

    // DEFINE O QUE VAI SER MOSTRADO NA 'localhost:54000/clientes'
    rota.get('/hoteis/', (requisicao, resposta) =>{
    execSQL('SELECT * FROM WHotel', resposta);
    })
    
    rota.get('/quartos/',(requisicao,resposta) =>{
        execSQL('SELECT * FROM WQuarto', resposta);
     })

    //o simbolo ? indica que id na rota abaixo é opcional
    rota.get('/hoteis/:id?', (requisicao, resposta) => {
    let filtro = '';
    if (requisicao.params.id)
        filtro = ' where HotelId=' + parseInt(requisicao.params.id);
    execSQL('SELECT * from WHotel ' + filtro, resposta);
    })

    /*
    
    rota.post('/clientes', (requisicao, resposta) =>{ 
        const id = parseInt(requisicao.body.id);
        const nome = requisicao.body.nome.substring(0,150); 
        const cpf = requisicao.body.cpf.substring(0,11); 
        execSQL(`INSERT INTO Clientes(ID, Nome, CPF) VALUES(${id},'${nome}','${cpf}')`, resposta); 
        resposta.end(resposta.json({ mensagem: 'Incluído!'})); })
    */ 


    //inserindo cliente
    rota.post('/clientes/inserir', (requisicao, resposta) => {
        const nome = requisicao.body.nome.substring(0,40); 
        const sobrenome = requisicao.body.sobrenome.substring(0,40);
        const email = requisicao.body.email.substring(0,70);
        const senha = requisicao.body.senha.substring(0,12);
        const cpf = requisicao.body.cpf.substring(0,11);
        const cep = requisicao.body.cep.substring(0,5);
        const rua = requisicao.body.rua.substring(0,40);
        const cidade = requisicao.body.cidade.substring(0,50);
        execSQL(`insert into WClienteHoteis values ('${nome}','${sobrenome}','${senha}','${email}','${cpf}','${cep}','${rua}','${cidade}')`, resposta);    
    })

    rota.get('/clientes/', (requisicao,respost) => {
        execSQL('select * from WClienteHoteis',respost);
    })


    //seleciona os quartos de certo hotel
    rota.get('/quartos/hotel/:idhotel?/' ,(requisicao, resposta) => {
        let filtro = '';
        if (requisicao.params.idhotel !='none')
            filtro =" and WQuarto.hotelId= "+requisicao.params.idhotel;
        execSQL('select WQuarto.* from WHotel,WQuarto where WQuarto.hotelId = WHotel.HotelId ' + filtro, resposta);
        })
    

        rota.get('/carrinho/:id?/' ,(requisicao, resposta) => {
            let filtro = '';
            if (requisicao.params.idhotel !='none')
                filtro =" where id_Cliente = "+requisicao.params.id;
            execSQL('select * from WCarrinho ' + filtro, resposta);
            })

        rota.post('/carrinho/inserir/',(requisicao,resposta) => {
            const id_Cliente = requisicao.cliente;
            const id_quarto = requisicao.quarto;
            const preco = requisicao.preco;
            execSQL(`insert into WCarrinho values (${id_Cliente},${id_quarto},${preco})`, resposta);    
        }

    //busca
    rota.get('/hoteis/:nome?/:rate?/:cidade?/:categoria?', (requisicao, resposta) => {
        let filtro = '';
        if (requisicao.params.nome !='none')
            filtro =" where HotelName like '%"+requisicao.params.nome+"%'";
            else if(requisicao.params.nome ='none')
                filtro+=' where 1=1';
        if (requisicao.params.rate !='0')
            filtro =' where Rating>' + parseInt(requisicao.params.rate);
            else if(requisicao.params.rate ='none')
                filtro+=' and 1=1';
        if (requisicao.params.cidade != 'none')
            filtro+=' and City=' +"'"+ requisicao.params.cidade+"'";
            else if(requisicao.params.cidade ='none')
                filtro+=' and 1=1';
        if (requisicao.params.categoria != 'none')
            filtro+=' and Category='+"'" + requisicao.params.categoria+"'";
        execSQL('SELECT * from WHotel ' + filtro, resposta);
        })


//explicitando a porta da api
app.listen(porta);
console.log('API Funcionando!');