import configurationLogRepository from "../../lib/repository/mongodb/configuration-log.repository";
import * as XLSX from "xlsx";
import fs from "fs";

export async function GET() {
  try {
    // Executar a agregação com allowDiskUse
    const cursor = await configurationLogRepository.aggregate(
    [
        {
            $match: {
            $or: [
                {
                "actual_profile.ip.primary.port": 13005
                },
                {
                "actual_profile.ip.secondary.port": 13005
                },
                { "actual_profile.dns.port": 13005 }
            ],
            is_configured: true,
            model: "E3+4G"
            }
        },
        {
            $project: {iccid: 1, imei: 1, profile_name: 1}
        },
        {
            $sort: {
              imei: 1,
              created_at: -1,
            },
          },
        {
            $group: {
            _id: "$imei",
            latestDocument: { $first: "$$ROOT" },
            }
        }
        ],
      { allowDiskUse: true }
    );
    const data = await cursor.toArray();

    // Preparar os dados para salvar no XLSX
    const formattedData = data.map((doc: any) => ({
      imei: doc._id,
      iccid: doc.latestDocument.iccid,
      profile_name: doc.latestDocument.profile_name
    }));

    // Criar o workbook e a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Adicionar a worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Gerar o arquivo em formato binário (buffer)
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Salvar o buffer no sistema de arquivos com fs.writeFileSync
    const filePath = "get-configuration-log-from-specific-port.xlsx";
    fs.writeFileSync(filePath, buffer);

    console.log(`Arquivo salvo em: ${filePath}`);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar arquivo XLSX:", error);
    return new Response(JSON.stringify({ error: "Erro ao gerar arquivo XLSX" }), { status: 500 });
  }
}
