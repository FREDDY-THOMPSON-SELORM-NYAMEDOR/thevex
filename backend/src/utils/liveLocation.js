function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeLocation(source) {
  if (!source) return null;

  const latitude = toNumber(source.current_latitude ?? source.latitude ?? source.lat);
  const longitude = toNumber(source.current_longitude ?? source.longitude ?? source.lng ?? source.lon);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    latitude,
    longitude,
    updatedAt: source.location_updated_at || source.locationUpdatedAt || source.updatedAt || null,
    userId: source.id || source.user_id || null,
    name: source.name || null
  };
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceMeters(firstLocation, secondLocation) {
  if (!firstLocation || !secondLocation) return Number.POSITIVE_INFINITY;

  const earthRadius = 6371000;
  const lat1 = toRadians(firstLocation.latitude);
  const lat2 = toRadians(secondLocation.latitude);
  const deltaLat = toRadians(secondLocation.latitude - firstLocation.latitude);
  const deltaLng = toRadians(secondLocation.longitude - firstLocation.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function midpointLocation(firstLocation, secondLocation) {
  if (!firstLocation && !secondLocation) return null;
  if (!firstLocation) return { ...secondLocation };
  if (!secondLocation) return { ...firstLocation };

  return {
    latitude: (firstLocation.latitude + secondLocation.latitude) / 2,
    longitude: (firstLocation.longitude + secondLocation.longitude) / 2
  };
}

function describePickupSequence(sequence) {
  if (!Array.isArray(sequence) || sequence.length === 0) return 'Waiting for live locations';
  return `Pickup order: ${sequence.map((entry) => entry.name || `User ${entry.userId}`).join(' -> ')}`;
}

function buildLiveMatchState({ match, user1, user2 }) {
  if (!match) return null;

  const user1Location = normalizeLocation(user1);
  const user2Location = normalizeLocation(user2);
  const carLocation = midpointLocation(user1Location, user2Location);

  const pickupCandidates = [
    user1Location ? { ...user1Location, userId: match.user1_id, name: user1?.name || 'Rider 1' } : null,
    user2Location ? { ...user2Location, userId: match.user2_id, name: user2?.name || 'Rider 2' } : null
  ].filter(Boolean);

  const pickupSequence = carLocation
    ? pickupCandidates.slice().sort((first, second) => distanceMeters(first, carLocation) - distanceMeters(second, carLocation))
    : pickupCandidates;

  return {
    matchId: match.id,
    carLocation,
    user1Location,
    user2Location,
    pickupSequence,
    nextPickupUserId: pickupSequence[0]?.userId || null,
    pickupSummary: describePickupSequence(pickupSequence)
  };
}

module.exports = {
  normalizeLocation,
  distanceMeters,
  midpointLocation,
  buildLiveMatchState,
  describePickupSequence
};