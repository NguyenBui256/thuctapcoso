import React, { useState, useRef } from 'react';

// Add watcher related states
const [watchers, setWatchers] = useState([]);
const [showWatcherDropdown, setShowWatcherDropdown] = useState(false);
const watcherRef = useRef();
const [availableUsers, setAvailableUsers] = useState([]); 