const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT= 4001;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'back_e_banco',
    password: 'ds564',
    port: 5432,
});

function calcularIdade(datanascimento){
    const dataAtual = new Date();
    const dataNasc = new Date(datanascimento);
    let idade = dataAtual.getFullYear() - dataNasc.getFullYear();
    const mes = dataAtual.getMonth() - dataNasc.getMonth(); 

    if(mes < 0 || (mes === 0 && dataAtual.getDate() < dataNasc.getDate())){
        idade--;
    }
    return idade;
}

function calcularSigno(datanascimento) {
    const dataNasc = new Date(datanascimento);
    const dia = dataNasc.getDate();
    const mes = dataNasc.getMonth() + 1;

    if ((dia >= 21 && mes === 3) || (dia <= 20 && mes === 4)) {
        return 'Áries';
    } else if ((dia >= 21 && mes === 4) || (dia <= 20 && mes === 5)) {
        return 'Touro';
    } else if ((dia >= 21 && mes === 5) || (dia <= 20 && mes === 6)) {
        return 'Gêmeos';
    } else if ((dia >= 21 && mes === 6) || (dia <= 22 && mes === 7)) {
        return 'Câncer';
    } else if ((dia >= 23 && mes === 7) || (dia <= 22 && mes === 8)) {
        return 'Leão';
    } else if ((dia >= 23 && mes === 8) || (dia <= 22 && mes === 9)) {
        return 'Virgem';
    } else if ((dia >= 23 && mes === 9) || (dia <= 22 && mes === 10)) {
        return 'Libra';
    } else if ((dia >= 23 && mes === 10) || (dia <= 21 && mes === 11)) {
        return 'Escorpião';
    } else if ((dia >= 22 && mes === 11) || (dia <= 21 && mes === 12)) {
        return 'Sagitário';
    } else if ((dia >= 22 && mes === 12) || (dia <= 20 && mes === 1)) {
        return 'Capricórnio';
    } else if ((dia >= 21 && mes === 1) || (dia <= 18 && mes === 2)) {
        return 'Aquário';
    } else {
        return 'Peixes';
    }
};

app.use(express.json());

app.get('/', (req, res) => {
    res.send('A rota está funcionado!')
});

app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM usuarios');
        res.json({
            total: resultado.rowCount,
            usuarios: resultado.rows,
        });
    } catch (error) {
       console.error('Erro ao obter todos os usuários', error); 
       res.status(500).send('Erro ao obter todos os usuários');
    }
});

app.post('/usuarios', async (req, res) => {
    try {
        const { nome, sobrenome, email, datanascimento, sexo} = req.body;

        const idade = calcularIdade(datanascimento);
        const signo = calcularSigno(datanascimento);

        await pool.query('INSERT INTO usuarios (nome, sobrenome, email, idade, signo, datanascimento, sexo) VALUES ($1, $2, $3, $4, $5, $6, $7)', [nome, sobrenome, email, idade, signo, datanascimento, sexo]);
        res.status(201).send({ mensagem: 'Usuário criado com sucesso! 💋' });
    }   catch (error) {
        console.error('Erro ao criar o usuário', error);
        res.status(500).json({ message: 'Erro ao criar o usuário' });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
         await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.status(200).send({mensagem: 'Usuário deletado com sucesso'});
    } catch (error) {
        console.error('Erro ao deletar o usuário', error); 
       res.status(500).send('Erro ao deletar o usuário');
    }
});

app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, sobrenome, email, datanascimento, sexo } = req.body;

        const idade = calcularIdade(datanascimento);
        const signo = calcularSigno(datanascimento);

        await pool.query('UPDATE usuarios SET nome = $1, sobrenome = $2, email = $3, idade = $4, signo = $5, datanascimento = $6, sexo = $7 WHERE id = $8', [nome, sobrenome, email, idade, signo, datanascimento, sexo, id]);
        res.status(201).send({mensagem: 'Usuário atualizado com sucesso'});
    } catch (error) {
        console.error('Erro ao atualizar o usuário', error); 
       res.status(500).send('Erro ao atualizar o usuário');
    }
});

app.get('/usuarios/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if(resultado.rowCount == 0){
            res.status(404).send({mensagem: 'Id não encontrado'})
        } else{
            res.json({
                usuario: resultado.rows[0],
            });
        }
        
    } catch (error) {
        console.error('Erro ao obter todos o usuário pelo id', error); 
        res.status(500).send('Erro ao obter todos o usuário pelo id');
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});