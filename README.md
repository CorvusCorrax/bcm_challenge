This repo was made to complete the challenge at https://github.com/BCM-ENERGY-team/bcm-backend-interview/blob/master/code.README.md

Now for the secondary tasks :

- Provider Air Moon frequently takes a long time to respond (but it does send back data). Depending on the way you developed the API it may have performance impacts on the whole search. How would you take care of this ?

  The promise-based system used permit some asynchronicity. The Air Moon call could be completely separated from the rest and integrated later (or not if it is too long).

- Provider Air Jazz has downtime issues from time to time, and returns a HTTP 502 Bad Gateway error. Once again, how would you handle this so it does not penalize the whole API.

  We could continue to process the data even if the Air Jazz promise fails. I did not implement it because it would mean that we do not return a potentially cheaper flight to the user, a decision that must be taken with care.

- The API we just created is to be used by our partners. How would you handle security ? We need to make sure only authenticated users (and authorized) can access this API.

  We could use tokens (JSON Web Token comes to mind) that could be obtained by authentifying in an https POST route like /auth. Once a token is obtained, it must be sent with every request to authentify the user.

- We would want to rate limit our API, so each of our client has a limited number of allowed calls. How would you handle this ?

  We could use JWT from the previous point to uniquely identify each users, and then keep track of their requests either through a database or in-memory with an object. Once they exceed the limit, we return a message explaining why they must wait.

- Imagine we now have a lot of incoming traffic on our API, and there is some overlap on the search requests. How could we improve the program ?

  I implemented a basic caching service (that could probably be improved a lot) so that we query the providers again only once per minute
