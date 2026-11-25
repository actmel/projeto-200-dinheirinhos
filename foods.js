/* Banco de alimentos do Projeto 200 dinheirinhos */
/* ===== Banco de alimentos (por 100 g; valores aproximados baseados em TACO/TBCA; preço R$/kg de referência) =====
 id, nome, categoria, kcal, P, C, G, gramas da medida, medida caseira, preço/kg, grupo de troca, restrições */
const F={};[
['arroz','Arroz branco cozido','Cereais e tubérculos',128,2.5,28.1,.2,25,'col. de sopa',6,'carb',''],
['macarrao','Macarrão cozido','Cereais e tubérculos',150,5,30,.9,110,'pegador',9,'carb','glu'],
['batata','Batata cozida','Cereais e tubérculos',52,1.2,11.9,0,90,'unidade média',5,'carb',''],
['pao','Pão francês','Cereais e tubérculos',300,8,58.6,3.1,50,'unidade',14,'carb','glu'],
['aveia','Aveia em flocos','Cereais e tubérculos',394,13.9,66.6,8.5,15,'col. de sopa',14,'carb','glu'],
['feijao','Feijão cozido','Leguminosas',76,4.8,13.6,.5,86,'concha',7,'leg',''],
['lentilha','Lentilha cozida','Leguminosas',93,6.3,16.3,.5,86,'concha',12,'leg',''],
['grao','Grão-de-bico cozido','Leguminosas',164,8.9,27.4,2.6,80,'concha',12,'leg',''],
['frango','Peito de frango grelhado','Carnes, ovos e proteínas',159,32,0,2.5,100,'filé pequeno',20,'prot','carne'],
['carne','Patinho bovino grelhado','Carnes, ovos e proteínas',219,35.9,0,7.3,100,'bife',38,'prot','carne caro'],
['ovo','Ovo cozido','Carnes, ovos e proteínas',146,13.3,.6,9.5,50,'unidade',16,'prot','ovo'],
['tofu','Tofu','Carnes, ovos e proteínas',64,6.6,2,4,50,'fatia',40,'prot','soy caro'],
['soja','Proteína de soja texturizada (seca)','Carnes, ovos e proteínas',329,52,30,2.7,10,'col. de sopa',15,'prot','soy'],
['leite','Leite integral','Laticínios',61,3.2,4.5,3.3,200,'copo',5,'dairy','lac'],
['iogurte','Iogurte natural integral','Laticínios',61,3.5,4.7,3.2,170,'pote',10,'dairy','lac'],
['queijo','Queijo mussarela','Laticínios',330,22.6,3,25.2,20,'fatia',40,'dairy2','lac'],
['banana','Banana prata','Frutas',98,1.3,26,.1,70,'unidade',7,'fruit',''],
['amendoim','Pasta de amendoim','Gorduras e outros',588,25,20,50,15,'col. de sopa',30,'fat','nut'],
['azeite','Azeite de oliva','Gorduras e outros',884,0,0,100,13,'col. de sopa',45,'fat2','']
].forEach(a=>F[a[0]]={id:a[0],n:a[1],cat:a[2],k:a[3],p:a[4],c:a[5],f:a[6],mg:a[7],mu:a[8],pr:a[9],g:a[10],t:a[11]});
