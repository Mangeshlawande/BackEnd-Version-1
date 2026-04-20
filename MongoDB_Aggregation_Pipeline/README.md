[LINK gist/github.com ](https://gist.github.com/hiteshchoudhary)

## 116 .
## 1. How you can collect  Active users from MongoDB Database ? or how many users are active ?
    
```json

      [{
    $match: {
      isActive: true
    }},
    {
    $count: "activeUsers"
    }]

```
  

# 117. Grouping in MongoDB

## 2.  What is the average age of all users ??

```json
        [{
    $group: {
      _id: null,
      averageAge:{
        $avg:"$age"
      } 
      }
    }]
```

 ## 3. List the top 5 most common favourite fruit among the users

    ```json
    [
    {
        $group:{
        _id : "$favoriteFruit",
        count:{
            $sum : 1
        }}
    },
    {
    $sort:{
        count:-1
    }},
    {
        $limit: 5
    }]

    ```
   

# 118. Group sum and more

## 4. Find the total number of males and females ? 
 ```json
    [
    {
        $group: {
        _id: "$gender",
        count : {
        $sum :1
        }
        }
    }

    ]


```

## 5. Which country has the highest number of register user ? 
```json
    [
    {
        $group: {
        _id: "$company.location.country",
        count : {
        $sum :1
        }
        }
    },
    {
        $sort:{
        count:-1
        }
    },
    {
        $limit: 1
    }
    ]
```
## 6. List all unique eyecolor present in the collection ?
```json
    [
    {
        $group: {
        _id: "$eyeColor",
        count: {
            $sum: 1,
        },
        }
    }
    ]
```

# 119. Dealing with arrays in aggregation

## 7.  What is the Average Number of Tags per User ? 

```json
    [
    {$unwind: "$tags",
    },
    {
        $group: {
        _id: "$_id",
    numberOfTags:{ $sum:1}
    }
    },
    {
        $group: {
        _id: null,
        avgNumberOfTags: {$avg: "$numberOfTags"}
        }
    } 
    ]  

    OR [use 2nd query]

    [
    {
        $addFields: {
        numberOfTags: {
            $size: {$ifNull:["$tags",[]]}
        }
        }
    },
    {
        $group: {
        _id: null,
        avgNumberOfTags: {
            $avg: "$numberOfTags"
        }
        }
    }
    ]
```
# 120. Match and project pipeline

## 8. How many users have 'enim' as one of their tags  ?? 
 $match is used for filter 
```json
    [
    {
        $match: {
        tags: "enim" // array : value
        }
    },
    {
        $count:"userWithEnim" // return count of above query 
    }
    ]
```

## 9. what are names and age of users who are inactive and have 'vlit' as tags 
// the tag should have valid via the match 
```json
    [
        //pipeline:1
        {
        $match: {
            isActive:false, tags:"velit"
        }
        },
        //pipeline:2
        {
            $project: {
        name:1,
        age:1
        }},
    ]
```
## 10 How many users have a phone number starting with  '+1(940) ??
// create regex using chatgpt 
```json
    [
    {
        $match: {
        "company.phone": /^\+1 \(940\)/
        }
    },
    {
        $count: 'UniquePhoneNO'
    }
    ]
```

# 121. Match all operators of aggregation


## 11. who has registered the most recently ? 
```json
    [
    {
        $sort: {
        registered: -1
        }
    } ,
    {$limit: 4},
    {
        $project: {
        name:1,
        registered :1,
        favoriteFruit:1
        }
    }
    ]
```
## 12 . Categorized user by their favorite fruits ? 

// $push  operator create array for me or append specified value to an array 
```json
    [
    {
        $group: {
        _id: "$favoriteFruit",
        users: {
            $push: "$name"
        }
        }
    }
    ]
```

## 13.How many users Have 'ad' as the secode tag in their list of tags ?
```json
    [
    {
      $match: {
        "tags.1":"ad"
      }
    },
    {
      $count: 'secondTagsAd'
    }
    ]
```
## 14. Find users who have both 'enim' and 'ad' as their tags ??

* $all operator select rhe document where the value of fieldis an array that contain specified element .

```json
        [
        {
            $match: {
            "tags.1":"ad"
            }
        },
        {
            $count: 'secondTagsAd'
        }
        ]

```

## 15. List all companies located in USA with their corresponding user account ??

```json
    [
    {
        $match: {
        "company.location.country" : "USA"
        }
    },
    { $group: {
        _id: null,	
        userCount:{$sum:1}
    }}
    ]
```

*  The $lookup stage adds a new array field to each input document. The new array field contains the matching documents from the "joined" collection.


# 122. Lookup in MongoDB aggregation
//query applied on books table 

```json

    [
    {
        $lookup: {
        from: "authors",
        localField: "author_id",
        foreignField: "_id",
        as: "author_details"
        }
    },
    {
        $addFields: {
        author_details:{
            $first : "$author_details"
        }
        }
    }
    ]  OR
        [
    {
        $lookup: {
        from: "authors",
        localField: "author_id",
        foreignField: "_id",
        as: "author_details"
        }
    },
    {
        $addFields: {
        author_details:{
            $arrayElemAt:["$author_details", 0]
        }
    }
    },
    ]
```



