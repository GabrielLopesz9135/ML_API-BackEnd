const axios = require('axios');

exports.searchProducts = async (req, res) => {
    try {
        const { termoPesquisado, limit, precoMinimo, precoMaximo } = req.query;

        let apiURL = 'https://fakestoreapi.com/products';

        if (termoPesquisado && termoPesquisado.trim() !== '') {
            apiURL = `https://fakestoreapi.com/products/category/${termoPesquisado.trim().toLowerCase()}`;
        }
        
        const params = {};
        
        if (limit) params.limit = limit;
        
        params.sort = 'desc'; 

        console.log(`Buscando na Fake Store API em: ${apiURL}`);

        const response = await axios.get(apiURL, { params });
        
        let products = response.data;
        
        const minPrice = precoMinimo ? parseFloat(precoMinimo) : null;
        const maxPrice = precoMaximo ? parseFloat(precoMaximo) : null;

        if (minPrice || maxPrice) {
            products = products.filter(product => {
                const productPrice = product.price;

                const isAboveMin = minPrice === null || productPrice >= minPrice;
                const isBelowMax = maxPrice === null || productPrice <= maxPrice;

                return isAboveMin && isBelowMax;
            });
        }
        
        if (products.length === 0) {
            return res.status(404).json({
                message: 'Nenhum produto encontrado com os filtros aplicados.',
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
                moeda: 'USD', 
                link: `https://fakestoreapi.com/products/${item.id}`, 
                condicao: 'new', 
                imagem: item.image 
            }))
        });

    } catch (error) {
        if (error.response) {
             if (error.response.status === 404) {
                 return res.status(404).json({
                    error: 'Recurso não encontrado',
                    message: `A categoria "${req.query.termoPesquisado}" não foi encontrada.`
                });
            }
            console.error('Erro na API Fake Store:', error.response.data);
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