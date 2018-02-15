const router = require('express').Router()
const passport = require('../config/auth')
const { Game } = require('../models')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
  .post('/turns' , authenticate,(req, res, next) => {
    console.log('accunt : ' , req.account)

    const { gameId , location , userId } = req.body

    Game.findById(gameId)
      .then((game) => {

      console.log('turn : ' , game.turn)

      let playerIndex;
      game.players.map( (item ,index) => {
         if( item.userId == userId ) {
            playerIndex = index
         }
      })

      if( game.turn != playerIndex && game.grid[location] == null) {

        const newGrid = game.grid.slice()

        newGrid[location] = playerIndex

        game.grid = newGrid
        game.turn = playerIndex
        console.log('ok your turn ')
        game.save()

        io.emit('action', {
          type: 'GAME_UPDATED',
          payload: game
        })

      }else{
        console.log('not your turn ')
        res.send({ message : 'not your turn'})
      }

      })
      .catch((error) => next(error))



  })


  return router
}
