require('react');
require('graphql');
require('lodash');
require('subscriptions-transport-ws');
const { generateApolloClient } = require('@deep-foundation/hasura/client');
const { DeepClient } = require('@deep-foundation/deeplinks/imports/client');


main();

async function main () {
  const apolloClient = generateApolloClient({
    path: 'YOUR GQL PATH', // <<= HERE PATH TO UPDATE
    ssl: true
  });
  
  const unloginedDeep = new DeepClient({ apolloClient });
  const guestLoginResult = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guestLoginResult });
  const adminLogin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  console.log({ adminLogin })
  const adminDeep = new DeepClient({ deep: guestDeep, ...adminLogin });
  // console.log({ adminDeep })
  const { data: [{ id: newUserLinkId }] } = await adminDeep.insert({
    type_id: adminDeep.idLocal("@deep-foundation/core", "User")
  })
  
  const newUserLoginResultBeforeJoin = await unloginedDeep.login({
    linkId: newUserLinkId
  });
  console.log({ newUserLoginResultBeforeJoin });
  
  const joinInsertData = {
    type_id: adminDeep.idLocal("@deep-foundation/core", "Join"),
    from_id: newUserLinkId,
    to_id: adminDeep.linkId
  }
  console.log({ joinInsertData })
  const joinInsertResult = await adminDeep.insert(joinInsertData)
  console.log({ joinInsertResult });
  const newUserLoginResultAfterJoin = await unloginedDeep.login({
    linkId: newUserLinkId
  });
  console.log({ newUserLoginResultAfterJoin });
  const newUserDeep = new DeepClient({ deep: unloginedDeep, ...newUserLoginResultAfterJoin })
  const deep = newUserDeep
}