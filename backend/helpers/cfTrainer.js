const math = require('mathjs');
const songsRepo = require('../repositories/songs');

function getRatedItemsForUser(ratings, userIndex, numItems) {
  const ratedItems = [];
  //console.log("for getRatedItemsForUser start");
  for (let index = 0; index < numItems; index += 1) {
    if (ratings[userIndex][index] !== 0) {
      ratedItems.push(index);
    }
  }
  // console.log("for getRatedItemsForUser end");
  // console.log("ratedItems:", ratedItems);
  return ratedItems;
}

function arraysAreEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let index = 0; index < array1.length; index += 1) {
    if (array1[index] !== array2[index]) {
      return false;
    }
  }
  return true;
}

function typeCheckRatings(ratings) {
  if (!Array.isArray(ratings)) {
    throw new TypeError('The ratings and coMatrix field should be an array of arrays (matrix)');
  }
}

function typeCheckCoOccurrenceMatrix(coMatrix, numItems) {
  if (!(coMatrix instanceof math.Matrix)) {
    throw new TypeError('The occurrence matrix should be a mathJS Matrix object generated by createCoMatrix');
  }
  if (!arraysAreEqual(coMatrix.size(), [numItems, numItems])) {
    throw new RangeError('Co matrix has wrong dimensions. Make sure to generate it using createCoMatrix');
  }
}

function typeCheckUserIndex(userIndex, ratings) {
  if (!Number.isInteger(userIndex)) {
    throw new TypeError('The field userIndex should be an integer');
  }
  if ((userIndex < 0) || (userIndex >= ratings.length)) {
    throw new RangeError('User index out of rage');
  }
}

function checkRatingValues(ratingMatrix) {
  const allowedRatings = [0, 1];
  ratingMatrix.forEach((value) => {
    if ((!Number.isInteger(value)) || (!allowedRatings.includes(value))) {
      throw new TypeError('Wrong rating in rating array. Currently permitted values are 0 and 1');
    }
  });
  return true;
}

function getRecommendations(ratings, coMatrix, userIndex) {
  typeCheckRatings(ratings);
  let ratingsMatrix;
  try {
    ratingsMatrix = math.matrix(ratings);
  } catch (error) {
    throw new RangeError('Dimension error in ratings matrix');
  }
  const numItems = ratingsMatrix.size()[1];
  typeCheckCoOccurrenceMatrix(coMatrix, numItems);
  typeCheckUserIndex(userIndex, ratings);


  const ratedItemsForUser = getRatedItemsForUser(ratings, userIndex, numItems);
  const numRatedItems = ratedItemsForUser.length;
  if(numRatedItems == 0)
    return [];
  const similarities = math.zeros(numRatedItems, numItems);
  // console.log("similarities1:", similarities);
  // console.log("similarities1");
  for (let rated = 0; rated < numRatedItems; rated += 1) {
    for (let item = 0; item < numItems; item += 1) {
      similarities.set([rated, item], coMatrix.get([ratedItemsForUser[rated], item])
                                     + similarities.get([rated, item]));
    }
  }
  // console.log("similarities2:", similarities);
  // console.log("similarities2:");
  // Sum of each row in similarity matrix becomes one row:
  let recommendations = math.zeros(numItems);
  
  for (let y = 0; y < numRatedItems; y += 1) {
    for (let x = 0; x < numItems; x += 1) {
      recommendations.set([x], recommendations.get([x]) + similarities.get([y, x]));
    }
  }
  // console.log("recommendations:", recommendations);
  // console.log("recommendations1");
  recommendations = math.dotDivide(recommendations, numRatedItems);
  //console.log("recommendationsssss:", recommendations);
  const rec = recommendations.toArray();
  let recSorted = recommendations.toArray();
  recSorted.sort((a, b) => b - a);

  recSorted = recSorted.filter((element) => element !== 0);

  let recOrder = recSorted.map((element) => {
    const index = rec.indexOf(element);
    rec[index] = null; // To ensure no duplicate indices in the future iterations.

    return index;
  });

  recOrder = recOrder.filter((index) => !ratedItemsForUser.includes(index));

  return recOrder;
}

function createCoMatrix(ratings) {
  // We create the ratings matrix to ensure we have correct dimensions
  typeCheckRatings(ratings);
  let ratingsMatrix;
  try {
    ratingsMatrix = math.matrix(ratings);
  } catch (error) {
    throw new RangeError('Dimension error in ratings matrix');
  }
  
  checkRatingValues(ratingsMatrix);
  //console.log("ratingsMatrix:", ratingsMatrix);

  const nUsers = ratingsMatrix.size()[0];
  const nItems = ratingsMatrix.size()[1];

  const coMatrix = math.zeros(nItems, nItems);
  // console.log("coMatrix1:", coMatrix);
  // console.log("coMatrix start");
  
  for (let y = 0; y < nUsers; y += 1) {
    // User
    for (let x = 0; x < (nItems - 1); x += 1) {
      // Items in the user
      for (let index = x + 1; index < nItems; index += 1) {
      // Co-occurrence
        if (ratings[y][x] === 1 && ratings[y][index] === 1) {
          coMatrix.set([x, index], coMatrix.get([x, index]) + 1);
          coMatrix.set([index, x], coMatrix.get([index, x]) + 1); // mirror
        }
      }
    }
  }
  // console.log("coMatrix2:", coMatrix);
  // console.log("coMatrix end");
  return coMatrix;
}

var usersList="";

 fetchUserList = async function() {
  try {
      usersList = await songsRepo.fetchAllUsers(); //query
      console.log("Success fetch Users list for Collaborative fiiltering");
      return usersList;

  } catch (error) {
    console.log("Error fetch Users list for Collaborative fiiltering");
    return;
  }
};
fetchSongList = async function() {
  try {
      const songsList = await songsRepo.fetchAllSongs(); //query
      console.log("Success fetch Songs list for Collaborative fiiltering");
      return songsList;

  } catch (error) {
    console.log("Success fetch Songs list for Collaborative fiiltering");
    return;
  }
};
fetchLikeList = async function() {
  try {
      const likedSongsList = await songsRepo.fetchAllLikedSongs(); //query
      console.log("Success fetch Liked songs list for Collaborative fiiltering");
      return likedSongsList;

  } catch (error) {
    console.log("Error fetch Liked songs list for Collaborative fiiltering");
    return;
  }
};
setCFRec = async function(id,songs) {
  try {
      const numberOfUsers = await songsRepo.setCFRecommendations(id,songs); //query
      console.log("Count:",numberOfUsers);
      return numberOfUsers;

  } catch (error) {
    console.log("Error fetch Liked songs list for Collaborative fiiltering");
    return;
  }
};
exports.collaborativeFilter = async function (userIndex) {
  let users= await fetchUserList();
  let songs= await fetchSongList();
  let likedSongs= await fetchLikeList();
  //console.log("List of Users",users);
  //console.log("List of Songs",songs);
  //console.log("List of Liked songs",likedSongs);
  var ratings = new Array(users.length).fill(0).map(()=>new Array(songs.length).fill(0));
  for(let i=0;i<users.length;i++)
  {
    var songsLikedByUser = likedSongs.filter(function (el) {
      return el.user_id == users[i].user_id;
    });
    // console.log("userNo:",i);
    // console.log("songsLikedByUser:",songsLikedByUser);
    if( songsLikedByUser.length)
    {
      for(let j=0;j<songsLikedByUser.length;j++)
      {
        var likedSongDetails = songs.filter(function (el) {
          return el.song_id == songsLikedByUser[j].song_id;
        });
        //console.log("likedSongDetails:",likedSongDetails);
        ratings[i][ (likedSongDetails[0].id) - 1]=1;
      }
    }
  }
  //console.log("Ratings Array",ratings);
  const coMatrix = createCoMatrix(ratings);
  const recommendations = getRecommendations(ratings, coMatrix, userIndex);
  console.log("recommendations array:",recommendations);
  let recommendedSongs =[];
  for(i=0;i<recommendations.length;i++)
  {
    recommendedSongs.push(songs[recommendations[i]]);
  }
  console.log("recommendedSongs:",recommendedSongs);
  setCFRec(userIndex+1,recommendedSongs);   
  return recommendedSongs;  
}

exports.trainCF = async function (userIndex) {
  let users= await fetchUserList();
  let songs= await fetchSongList();
  let likedSongs= await fetchLikeList();
  var ratings = new Array(users.length).fill(0).map(()=>new Array(songs.length).fill(0));
  for(let i=0;i<users.length;i++)
  {
    var songsLikedByUser = likedSongs.filter(function (el) {
      return el.user_id == users[i].user_id;
    });
    if( songsLikedByUser.length)
    {
      for(let j=0;j<songsLikedByUser.length;j++)
      {
        var likedSongDetails = songs.filter(function (el) {
          return el.song_id == songsLikedByUser[j].song_id;
        });
        //console.log("likedSongDetails:",likedSongDetails);
        ratings[i][ (likedSongDetails[0].id) - 1]=1;
      }
    }
  }
  const coMatrix = createCoMatrix(ratings);
  for(let i = 1; i <= users.length; i++)
  {
    const recommendations = getRecommendations(ratings, coMatrix, i-1);
    //console.log("recommendations array:",recommendations);
    let recommendedSongs =[];
    for(let j=0;j<recommendations.length;j++)
    {
      recommendedSongs.push(songs[recommendations[j]]);
    }
   // console.log("recommendedSongs:",recommendedSongs);
    setCFRec(i,recommendedSongs);    
  }
}