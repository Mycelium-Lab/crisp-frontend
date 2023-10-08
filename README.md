# near-frontend

## Project setup
```
npm i
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Документация
# Верстка:
Родительским компонентом является файл /App.vue, он содержит в себе router-view, куда нестятся компоненты из папки /views. Так же он содержит в себе header, блок уведомлений (notifications-wrapper) и блок с социальными сетями (socials-wrapper).
При верстке используется scss, некоторые основные стили вынесены в файл /assets/scss/main.scss, например размеры текста и большинство цветов для кнопок и текста

# Структура проекта:
Для каждой страницы используется соответствующий компонент из папки /views, они рендерятся в тег router-view в App.vue, и переключаются последством роутинга /router/index.js. Роутер настроен так, чтобы сохранять историю. Использование несуществующего роута (app.crisp.exchange/foo-bar12345), а так же его отсутствие (app.crisp.exchange/), ведут на компонент swap. 

В папке /constants находятся два файла с константами:

1. charts.js используется чтобы хранить дефолтный набор настроек для графика, отрисовываемого с помощью библиотеки Apexcharts, при желании можно поменять их прямо в константе, или добавить какие-то параметры конкретной инстанции в компоненте, используя оператор spread (apexCharts = {...apexCharts, tooltip: {enabled: false})
2. в index.js есть такие константы как CONTRACT_ID, METHOD_NAMES (сюда надо добавлять новые методы, чтобы пользователю добавлялись права использования для них при логине), DEFAULT_SWAP_PAIR (при отсутствии последней использованной пары в localStorage компонент SwapView берет эту пару как дефолтную) и SWAP_TOKENS (перечисление всех используемых на данный момент токенов)

В папке /utils находятся пять файлов с многократно реиспользуемыми функциями и кодом:

1. format.js использует библиотеку ethers.js для преобразования количества токена, используя децималс (addDecimals), и для вычитания децималс, преобразовывая это количество в человеческий формат (removeDecimals)
2. index.js содержит в себе CONFIG который на данный момент настроен на testnet, эти значения можно поменять на mainnet
3. localStorage.js упрощает работу с localStorage, предоставляя функции для записи, чтения, и удаления записей из localStorage
4. number.js: toFixed() и isNumber() упрощают работу с числами в экспоненциальной записи (из-за неточности почти везде заменено на методы ethers.js)
5. tick.js используется для округления цены до ближайшего тика

# Инициализация приложения

При рендере приложения, в момент срабатывания хука created() в файле App.vue вызывается метод load, который последовательно вызывает следующие функции в store:

1. fetchCrispContract() инициализирует сущности walletSelector и setupModal библиотеки nearWalletSelector, а так же nearConnection (используя конфиг), и, затем, walletConnection (являющиеся сущностями самого nearAPI). При инициализации setupModal у пользователя появляется login prompt, если он еще не залогинен. После успешного логина страница обновляется, и, если пользователь залогинен, то инициализируется сущность контракта crispContract, которая впоследствии использует для простых вызовов функций контракта (не batch transactions)
2. fetchPools() получает с контракта список пулов вызывая соответствующий метод
3. fetchBalances(), используя accountId юзера, получает список балансов пользователя, инициализируя сущность tokenBalances. Ответ с get_balance_all_tokens приходит в виде одной строки, поэтому он разбивается в объект, а затем для каждого объекта идет запрос к ft_metadata(), чтобы получить дополнительные данные о токене - символ, иконка, количество децималс etc. Затем этот список сопоставляется с имеющимся (в constants/index.js) списком токенов, чтобы инициализировать объекты для отсутствующих балансов тоже, тк пользователь может не иметь токенов на крисп, но иметь их на нир кошельке. После всех манипуляций для каждого объекта tokenBalance вызывается так же метод ft_balance_of, чтобы получить так же баланс на кошельке нир, и в итоге на выходе мы получаем массив из объектов, где каждый объект баланса содержит в себе всю необходимую инфу о токене, его баланс крисп, и его баланс нир.
4. processTokensMetadata() используется для получения инфы о токенах, имеющихся в пулах, чтобы выводить для них дополнительные данные. Потенциально можно выпилить в будущем, так как теперь эта инфа дублируется так же в tokenBalances, но пока что используется в большинстве компонентов
5. processPositions перечисляет все позиции в пулах, полученных методом fetchPools, и инициализирует два массива: один со всеми позициями во всех пулах (для общего отображения внизу страницы liquidityView) и с позициями юзера (для подробного отображения на той же странице)
6. fetchDeposits получает депозиты пользователя, предоставленные для возможности займа другими пользователями, создавая сущность userDeposits для рендера на соответствующей странице
7. fetchBorrows получает займы пользователя, находит соответствующие позиции в списке userPositions и обновляет некоторые значения в них, чтобы на странице LiquidityView выводилась соответствующая инфа о том, что позиция находится в borrowed состоянии и некоторые дополнительные данные
_____
После выполнения всех этих функций приложение отображает всю необходимую информацию при переходе по различным страницам. Аналогичные вызовы происходят при функции reload() в компоненте store, которая вызывается при некоторых транзакциях, которые выполняются прямо на странице

# Вызов транзакций, классический способ и batch transactions

На данный момент в контракте используется два вида вызова транзакций.

Первый - упрощенный, когда требуется вызвать только одно действие в одном контракте, например вызов withdraw() в DepositView
В данном случае нам требуется только взять из store сущность crispContract, которая имеет в себе все существующие функции контракта, и вызвать ее в виде:
```
await contract.withdraw(
    {
        token: this.tokenW, // адрес токена, который потребуется снять
        amount: addDecimals(this.amountW, tokenObj), // количество токена с добавлением децималс
    }
)
```
после чего с помощью .then() мы обрабатываем вернувшийся промис, и диспатчим функцию reload(), т.к. такие функции можно вызывать прямо из приложения

Второй - так называемый batch transaction, функционал предоставляемый библиотекой near wallet selector, и он позволяет нам вызывать несколько действий в одном контракте, и несколько действий в нескольких контрактах, в рамках одной транзакции.
Пример: функция create_deposit в LendingView. Если мы поставим nearWallet как желаемый источник токена для создания депозита, то выполнится batchTx следующего вида: 
```
await wallet.signAndSendTransactions({
    transactions: [
        {
            receiverId: tokenObj.token,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "storage_deposit",
                        args: Buffer.from(JSON.stringify(argsDeposit)),
                        gas: 150000000000000,
                        deposit: 1
                    }
                },
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "ft_transfer_call",
                        args: Buffer.from(JSON.stringify(argsTransfer)),
                        gas: 150000000000000,
                        deposit: 1
                    }
                }
            ]
        },
        {
            receiverId: CONTRACT_ID,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "create_deposit",
                        args: Buffer.from(JSON.stringify(argsCreateDeposit)),
                        gas: 150000000000000
                        // deposit: 1
                    }
                }
            ]
        }
    ]
})
```
Функция signAndSendTransactions является функцией объекта wallet, который нужно получить из store. 
Параметр transactions - массив вызовов контрактов, к которым мы обратимся, и в каждой транзакции есть массив receiverId - адрес контракта, в котором будут выполнены actions, и сами actions - это список действий в этом контракте. 
В каждом действии необходимо указать тип, а так же параметры, такие как название метода, максимальное количество газа на транзакцию, а так же для некоторых транзакций нужно еще указать депозит (в NEAR). Аргументы составляются так же, как и для предыдущего вида вызова транзакции, но их необходимо кастануть сначала в строку, а затем в буфер (как указано в примере)
