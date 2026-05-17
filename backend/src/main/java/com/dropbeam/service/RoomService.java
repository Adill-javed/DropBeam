package com.dropbeam.service;

import com.dropbeam.model.Room;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public Room createRoom() {
        Room room = new Room();
        rooms.put(room.getId(), room);
        return room;
    }

    public Optional<Room> getRoom(String id) {
        return Optional.ofNullable(rooms.get(id));
    }

    public Collection<Room> getAllRooms() {
        return rooms.values();
    }

    public void deleteRoom(String id) {
        rooms.remove(id);
    }
}
