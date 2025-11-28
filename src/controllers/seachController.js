const axios = require('axios');

exports.searchProducts = async (req, res) => {
    try {
        const { termoPesquisado, limit, precoMinimo, precoMaximo, condicao } = req.query;

        if (!termoPesquisado || termoPesquisado.trim() === '') {
            return res.status(400).json({
                error: 'Parâmetro inválido',
                message: 'O parâmetro "termoPesquisado" é obrigatório.'
            });
        }
        const params = {
            q: termoPesquisado
        };

        if (limit) params.limit = limit;

        if (condicao) {
            if (condicao.toLowerCase() === 'novo') params.condition = 'new';
            else if (condicao.toLowerCase() === 'usado') params.condition = 'used';
            else params.condition = condicao;
        }

        if (precoMinimo || precoMaximo) {
            const min = precoMinimo || '*';
            const max = precoMaximo || '*';
            params.price = `${min}-${max}`;
        }
        const accessToken = process.env.ML_ACCESS_TOKEN;

        if (!accessToken) {
            console.error('ERRO: Token não configurado no .env');
            return res.status(500).json({ error: 'Erro de configuração do servidor (Token ausente)' });
        }

        console.log('Buscando no ML...');

        const response = await axios.get('https://api.mercadolibre.com/sites/MLB/search', { 
            params,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const products = response.data.results;

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado.',
                data: []
            });
        }

        return res.status(200).json({
            termo: termoPesquisado,
            total: products.length,
            resultados: products.map(item => ({
                id: item.id,
                titulo: item.title,
                preco: item.price,
                moeda: item.currency_id,
                link: item.permalink,
                condicao: item.condition,
                imagem: item.thumbnail
            }))
        });

    } catch (error) {
        if (error.response) {
            console.error('Erro na API ML:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro na API externa',
                detalhes: error.response.data
            });
        }

        console.error('Erro interno:', error.message);
        return res.status(500).json({
            error: 'Erro Interno',
            message: 'Erro ao processar requisição.'
        });
    }
};