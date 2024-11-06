[
  {
    $match: {
      lang: /es|pt/,
      "place.country": "Brasil",
    },
  },
  {
    $group: {
      _id: { $ifNull: [ // coalesce 
        "$in_reply_to_status_id_str",
        "$_id",
      ]},
      tweets: { $push: {
        tweet_id: "$_id",
        text: "$full_text",
        user: "$user",
        created_at: "$created_at.date",
      }},
      avg_retweets: { $avg: "$retweet_count" },
    },
  },
  {
    $project: {
      tweet: { $arrayElemAt: [{
        $filter: {
          input: "$tweets",
          as: "reply",
          cond: { 
            $eq: ["$$reply.tweet_id", "$_id"],
          },
        },
      }, 0 ]},
      replies: { $sortArray: { input: {
        $filter: {
          input: "$tweets",
          as: "reply",
          cond: { // eliminamos el mismo tweet
            $ne: ["$$reply.tweet_id", "$_id"],
          },
        },
      }, sortBy: {created_at: 1} } },
      avg_retweets: 1,
    },
  },
]
