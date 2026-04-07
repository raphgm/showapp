#!/usr/bin/env python3
"""Generate Show extension icons at all required sizes."""
import struct
import zlib
import os

SIZES = [16, 32, 48, 128]
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def create_png(width, height, pixels):
    """Create a PNG file from raw RGBA pixel data."""
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # filter: none
        for x in range(width):
            idx = (y * width + x) * 4
            raw_data += bytes(pixels[idx:idx + 4])

    compressed = zlib.compress(raw_data, 9)
    idat = make_chunk(b'IDAT', compressed)

    # IEND
    iend = make_chunk(b'IEND', b'')

    # Full PNG
    signature = b'\x89PNG\r\n\x1a\n'
    return signature + ihdr + idat + iend


def draw_icon(size):
    """Draw the Show icon: gradient circle with white play triangle."""
    pixels = [0] * (size * size * 4)  # RGBA

    cx, cy = size / 2, size / 2
    radius = size / 2

    # Draw gradient circle
    for y in range(size):
        for x in range(size):
            dx, dy = x - cx + 0.5, y - cy + 0.5
            dist = (dx * dx + dy * dy) ** 0.5

            if dist <= radius:
                # Gradient from #3b27b2 -> #8227b2 -> #b61cc9
                t = (x + y) / (2 * size)

                if t < 0.5:
                    t2 = t * 2
                    r = int(59 + (130 - 59) * t2)
                    g = int(39 + (39 - 39) * t2)
                    b = int(178 + (178 - 178) * t2)
                else:
                    t2 = (t - 0.5) * 2
                    r = int(130 + (182 - 130) * t2)
                    g = int(39 + (28 - 39) * t2)
                    b = int(178 + (201 - 178) * t2)

                # Anti-alias edge
                alpha = 255
                if dist > radius - 1:
                    alpha = int(255 * (radius - dist + 1))
                    alpha = max(0, min(255, alpha))

                idx = (y * size + x) * 4
                pixels[idx] = r
                pixels[idx + 1] = g
                pixels[idx + 2] = b
                pixels[idx + 3] = alpha

    # Draw play triangle
    tri_cx = cx + size * 0.03
    tri_size = size * 0.35

    # Triangle vertices
    ax, ay = tri_cx - tri_size * 0.4, cy - tri_size * 0.55
    bx, by = tri_cx + tri_size * 0.6, cy
    cxx, cyy = tri_cx - tri_size * 0.4, cy + tri_size * 0.55

    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            # Point-in-triangle test using barycentric coordinates
            v0x, v0y = cxx - ax, cyy - ay
            v1x, v1y = bx - ax, by - ay
            v2x, v2y = px - ax, py - ay

            dot00 = v0x * v0x + v0y * v0y
            dot01 = v0x * v1x + v0y * v1y
            dot02 = v0x * v2x + v0y * v2y
            dot11 = v1x * v1x + v1y * v1y
            dot12 = v1x * v2x + v1y * v2y

            denom = dot00 * dot11 - dot01 * dot01
            if denom == 0:
                continue

            inv_denom = 1.0 / denom
            u = (dot11 * dot02 - dot01 * dot12) * inv_denom
            v = (dot00 * dot12 - dot01 * dot02) * inv_denom

            if u >= 0 and v >= 0 and (u + v) <= 1:
                idx = (y * size + x) * 4
                pixels[idx] = 255
                pixels[idx + 1] = 255
                pixels[idx + 2] = 255
                pixels[idx + 3] = 255

    return pixels


def main():
    for size in SIZES:
        print(f"Generating icon{size}.png...")
        pixels = draw_icon(size)
        png_data = create_png(size, size, pixels)
        filepath = os.path.join(SCRIPT_DIR, f"icon{size}.png")
        with open(filepath, 'wb') as f:
            f.write(png_data)
        print(f"  ✓ Saved {filepath} ({len(png_data)} bytes)")

    print("\nAll icons generated!")


if __name__ == '__main__':
    main()
