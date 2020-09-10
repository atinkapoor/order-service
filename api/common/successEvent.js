const exportPayload = uniqueId => {
  const unixEpoch = new Date().getTime();

  return {
    event_id: `${uniqueId}`,
    resource_href: `https://api.order.com/v2/order/order/${uniqueId}`,
    meta: {
      status: 'pos',
      rider_id:
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      user_id: 'cca834b6-cd90-43c4-b778-b22ee790329a',
      resource_id: `${uniqueId}`
    },
    event_type: 'orders.release',
    event_time: unixEpoch
  };
};

module.exports = exportPayload;
