type AddressFields = {
  namaTempat?: string | null;
  provinsi?: string | null;
  kabupatenKota?: string | null;
  kecamatan?: string | null;
  desaKelurahan?: string | null;
  detailAlamat?: string | null;
};

export function hasCompleteAddress(user: AddressFields) {
  return Boolean(
    user.namaTempat &&
      user.provinsi &&
      user.kabupatenKota &&
      user.kecamatan &&
      user.desaKelurahan &&
      user.detailAlamat,
  );
}

export function formatAddress(user: AddressFields) {
  return [
    user.namaTempat,
    user.detailAlamat,
    user.desaKelurahan && `Desa/Kel. ${user.desaKelurahan}`,
    user.kecamatan && `Kec. ${user.kecamatan}`,
    user.kabupatenKota,
    user.provinsi,
  ]
    .filter(Boolean)
    .join(", ");
}
